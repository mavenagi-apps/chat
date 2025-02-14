import { type NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { fetchChatMessages, sendChatMessage } from "@/app/api/salesforce/utils";
import {
  decryptAndVerifySignedUserData,
  withAppSettings,
} from "@/app/api/server/utils";
import type {
  ChatSessionResponse,
  SalesforceChatMessage,
  SalesforceRequest,
} from "@/types/salesforce";
import {
  generateSessionInitRequestBody,
  generateSessionInitRequestHeaders,
  convertMessagesToTranscriptText,
  SESSION_CREDENTIALS_REQUEST_HEADERS,
} from "@/app/api/salesforce/utils";
import { HANDOFF_AUTH_HEADER } from "@/app/constants/authentication";
import { SALESFORCE_MESSAGE_TYPES } from "@/types/salesforce";
import type { VerifiedUserData } from "@/types";

function containsChatRequestSuccess(messages: SalesforceChatMessage[]) {
  return messages.some(
    (message) => message.type === SALESFORCE_MESSAGE_TYPES.ChatRequestSuccess,
  );
}

// initializing salesforce chat session
export async function POST(req: NextRequest) {
  return withAppSettings(req, async (req, settings) => {
    const originalReferrer = req.headers.get("referer") || "unknown";
    const { handoffConfiguration } = settings.misc;
    if (handoffConfiguration?.type !== "salesforce") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid handoff configuration type. Expected 'salesforce'.",
        },
        { status: 400 },
      );
    }
    const {
      chatHostUrl,
      chatButtonId,
      deploymentId,
      orgId: organizationId,
      eswLiveAgentDevName,
      allowAnonymousHandoff,
    } = handoffConfiguration;

    const {
      customData,
      email,
      language,
      messages,
      screenResolution,
      signedUserData,
      unsignedUserData,
      userAgent,
    } = (await req.json()) as SalesforceRequest;

    if (
      !allowAnonymousHandoff &&
      !unsignedUserData &&
      !signedUserData &&
      !email
    ) {
      return NextResponse.json({ error: "Missing user data" }, { status: 400 });
    }

    let verifiedUserInfo: VerifiedUserData | undefined;
    if (signedUserData) {
      verifiedUserInfo = (await decryptAndVerifySignedUserData(
        signedUserData,
        settings,
      )) as VerifiedUserData;
    }

    const userData =
      verifiedUserInfo || unsignedUserData || (email ? { email } : undefined);

    try {
      const chatSessionCredentialsResponse = await fetch(
        chatHostUrl + "/chat/rest/System/SessionId",
        {
          method: "GET",
          headers: SESSION_CREDENTIALS_REQUEST_HEADERS,
        },
      );

      if (!chatSessionCredentialsResponse.ok) {
        throw new Error("Failed to initiate chat session");
      }

      const chatSessionCredentials: ChatSessionResponse =
        await chatSessionCredentialsResponse.json();

      const requestBody = generateSessionInitRequestBody({
        buttonId: customData?.buttonId || chatButtonId,
        chatSessionCredentials,
        deploymentId,
        eswLiveAgentDevName:
          customData?.eswLiveAgentDevName || eswLiveAgentDevName,
        language,
        organizationId,
        originalReferrer: originalReferrer || undefined,
        screenResolution,
        sessionKey: chatSessionCredentials.key,
        userAgent,
        userData,
      });

      if (process.env.ENABLE_API_LOGGING) {
        console.log("REQUEST BODY", JSON.stringify(requestBody, null, 2));
      }

      const chatSessionInitResponse = await fetch(
        chatHostUrl + "/chat/rest/Chasitor/ChasitorInit",
        {
          method: "POST",
          headers: generateSessionInitRequestHeaders(
            chatSessionCredentials.key,
            chatSessionCredentials.affinityToken,
          ),
          body: JSON.stringify(requestBody),
        },
      );

      if (!chatSessionInitResponse.ok) {
        console.error(
          "Failed to initiate chat session",
          chatSessionInitResponse,
        );
        throw new Error("Failed to initiate chat session");
      }

      // Check for the presence of the "ChatRequestSuccess" message
      const initialChatMessages = await fetchChatMessages(
        chatHostUrl,
        -1,
        chatSessionCredentials.affinityToken,
        chatSessionCredentials.key,
      );

      if (containsChatRequestSuccess(initialChatMessages.messages)) {
        // Send messages
        await sendChatMessage(
          convertMessagesToTranscriptText(messages),
          chatSessionCredentials.affinityToken,
          chatSessionCredentials.key,
          chatHostUrl,
        );
      }

      const token = jwt.sign(
        {
          scope: "appUser",
          sessionId: chatSessionCredentials.id,
          sessionKey: chatSessionCredentials.key,
          affinityToken: chatSessionCredentials.affinityToken,
          isAuthenticated: false,
        },
        handoffConfiguration.apiSecret,
        {
          keyid: organizationId,
        },
      );

      return NextResponse.json(
        {
          ...chatSessionCredentials,
        },
        {
          headers: {
            [HANDOFF_AUTH_HEADER]: token,
          },
        },
      );
    } catch (error) {
      console.error("initiateChatSession failed:", error);
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  });
}

export const maxDuration = 900;
