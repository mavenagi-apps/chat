import type * as SunshineConversationsClientModule from "sunshine-conversations-client";

import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from "@/src/app/api/zendesk/utils";
import { type NextRequest, NextResponse } from "next/server";
import {
  withAppSettings,
  decryptAndVerifySignedUserData,
} from "@/src/app/api/server/utils";

import jwt from "jsonwebtoken";
import { HANDOFF_AUTH_HEADER } from "@/src/app/constants/authentication";
import type { VerifiedUserData } from "@/src/types";
import { nanoid } from "nanoid";

const ANONYMOUS_USER_PREFIX = "maven-anonymous-user";

const getOrCreateZendeskUser = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  verifiedUserData: VerifiedUserData | undefined,
  appId: string,
) => {
  const apiInstance = new SunshineConversationsClient.UsersApi();

  if (verifiedUserData?.email) {
    try {
      const { user } = await apiInstance.getUser(appId, verifiedUserData.email);
      if (user) {
        console.log("User already exists");
        return user;
      }
    } catch (error: any) {
      if ("status" in error && error.status === 404) {
        // Expected: user does not exist
      } else {
        console.error("Error getting user", error);
        throw error;
      }
    }
  }

  const externalId =
    verifiedUserData?.email || `${ANONYMOUS_USER_PREFIX}-${nanoid()}`;
  const profile = verifiedUserData?.email
    ? {
        givenName: verifiedUserData?.firstName || undefined,
        surname: verifiedUserData?.lastName || undefined,
        email: verifiedUserData?.email || undefined,
        locale: "en-US",
      }
    : undefined;

  const { user } = await apiInstance.createUser(appId, {
    externalId,
    profile,
  });

  return user;
};

const getOrCreateZendeskConversation = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  userId: string,
  appId: string,
  customFieldValues?: Record<string, string | boolean | number | undefined>,
) => {
  const apiInstance = new SunshineConversationsClient.ConversationsApi();

  const { conversations } = await apiInstance.listConversations(appId, {
    userId,
  });
  if (conversations.length > 0) {
    console.log("Conversation already exists");
    return conversations[0];
  }

  const conversationCreateBody =
    new SunshineConversationsClient.ConversationCreateBody("personal");
  const participants = [{ userId, subscribeSDKClient: false }];
  conversationCreateBody.setParticipants(participants);
  conversationCreateBody.setDisplayName("Chat with Support");
  conversationCreateBody.setDescription(
    "A conversation for customer support inquiries.",
  );
  const { conversation } = await apiInstance.createConversation(
    appId,
    conversationCreateBody,
  );

  if (customFieldValues) {
    try {
      // Convert "key: value" to "dataCapture.ticketField.key": value
      const prefixedCustomFieldValues = Object.fromEntries(
        Object.entries(customFieldValues).map(([key, value]) => {
          return [`dataCapture.ticketField.${key}`, value];
        }),
      );

      const switchboardActionsApiInstance =
        new SunshineConversationsClient.SwitchboardActionsApi();
      const passControlBody = new SunshineConversationsClient.PassControlBody();
      passControlBody.setSwitchboardIntegration("zd-agentWorkspace");
      passControlBody.setMetadata(
        prefixedCustomFieldValues as Record<string, string | number | boolean>,
      );
      await switchboardActionsApiInstance.passControl(
        appId,
        conversation.id,
        passControlBody,
      );
    } catch (error) {
      console.error("Error passing control to zendesk", error);
    }
  }

  return conversation;
};

const createUnauthenticatedMessage = (userId: string, email: string) => ({
  author: {
    type: "business",
    userId,
  },
  content: {
    type: "text",
    text: `Maven AGI is handing off this conversation to a \
human agent but the user is not authenticated. The agent \
will need to confirm the user's identity before continuing.

Claiming email address: ${email}`,
  },
});

export async function POST(req: NextRequest) {
  return withAppSettings(req, async (request, settings) => {
    const { messages, signedUserData, email, customFieldValues } =
      await request.json();
    const { handoffConfiguration } = settings.misc;

    if (handoffConfiguration?.type !== "zendesk") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid handoff configuration type. Expected 'zendesk'.",
        },
        { status: 400 },
      );
    }

    const { apiKey, apiSecret } = handoffConfiguration;

    if (!apiKey || !apiSecret) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required Zendesk configuration. Both apiKey and apiSecret are required.",
        },
        { status: 400 },
      );
    }

    if (!(email || signedUserData)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "User identification required. Please provide either an email or signed user data.",
        },
        { status: 400 },
      );
    }

    const [SunshineConversationsClient, zendeskConversationsAppId] =
      await getSunshineConversationsClient(handoffConfiguration);

    let verifiedUserInfo: VerifiedUserData | undefined;
    if (signedUserData) {
      verifiedUserInfo = (await decryptAndVerifySignedUserData(
        signedUserData,
        settings,
      )) as VerifiedUserData;
    }

    const { id: userId } = await getOrCreateZendeskUser(
      SunshineConversationsClient,
      verifiedUserInfo,
      zendeskConversationsAppId,
    );

    const conversation = await getOrCreateZendeskConversation(
      SunshineConversationsClient,
      userId,
      zendeskConversationsAppId,
      customFieldValues,
    );

    const { id: conversationId } = conversation;

    const isAuthenticated = !!verifiedUserInfo;
    if (!isAuthenticated) {
      messages.push(createUnauthenticatedMessage(userId, email));
    }

    await postMessagesToZendeskConversation(
      SunshineConversationsClient,
      conversationId,
      userId,
      zendeskConversationsAppId,
      messages,
    );

    const token = jwt.sign(
      { scope: "appUser", userId, conversationId, isAuthenticated },
      apiSecret,
      {
        keyid: apiKey,
      },
    );

    return NextResponse.json(
      { success: true },
      {
        headers: {
          [HANDOFF_AUTH_HEADER]: token,
        },
      },
    );
  });
}
