import type * as SunshineConversationsClientModule from 'sunshine-conversations-client';

import { getSunshineConversationsClient, postMessagesToZendeskConversation } from '@/app/api/zendesk/utils';
import { withAppSettings } from '@/app/api/server/utils';
import { type NextRequest, NextResponse } from 'next/server';
import {
  decryptAndVerifySignedUserData,
} from '@/app/api/server/utils';

import jwt from 'jsonwebtoken';
import { HANDOFF_AUTH_HEADER } from '@/app/constants/authentication';

interface VerifiedUserInfo {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: any;
}

interface UnverifiedUserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

const getOrCreateZendeskUser = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  unverifiedUserInfo: UnverifiedUserInfo,
  appId: string
) => {
  const apiInstance = new SunshineConversationsClient.UsersApi();

  if (unverifiedUserInfo.email) {
    try {
      const { user } = await apiInstance.getUser(appId, unverifiedUserInfo.email);
      if (user) {
        console.log('User already exists');
        return user;
      }
    } catch (error: any) {
      if ('status' in error && error.status === 404) {
        console.log('User does not exist');
      } else {
        console.error('Error getting user', error);
        throw error;
      }
    }
  }

  const { user } = await apiInstance.createUser(appId, {
    externalId: unverifiedUserInfo.email,
    profile: {
      givenName: unverifiedUserInfo.firstName,
      surname: unverifiedUserInfo.lastName,
      email: unverifiedUserInfo.email,
      locale: 'en-US',
    },
  });
  console.log('User created');
  return user;
};

const getOrCreateZendeskConversation = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  userId: string,
  appId: string
) => {
  const apiInstance = new SunshineConversationsClient.ConversationsApi();

  const { conversations } = await apiInstance.listConversations(appId, {
    userId,
  });
  if (conversations.length > 0) {
    console.log('Conversation already exists');
    return conversations[0];
  }

  const conversationCreateBody =
    new SunshineConversationsClient.ConversationCreateBody('personal');
  const participants = [{ userId, subscribeSDKClient: false }];
  conversationCreateBody.setParticipants(participants);
  conversationCreateBody.setDisplayName('Chat with Support');
  conversationCreateBody.setDescription(
    'A conversation for customer support inquiries.'
  );
  const { conversation } = await apiInstance.createConversation(
    appId,
    conversationCreateBody
  );

  return conversation;
};

export async function POST(req: NextRequest) {
  return withAppSettings(req, async (request, settings) => {
    const { messages, signedUserData } = await request.json();
    const { handoffConfiguration } = settings;

    if (!handoffConfiguration) {
      throw new Error('Handoff configuration not found');
    }

    const { apiKey, apiSecret } = handoffConfiguration;

    if (!apiKey || !apiSecret) {
      throw new Error('Invalid handoff configuration');
    }

    const [SunshineConversationsClient, zendeskConversationsAppId] =
      await getSunshineConversationsClient(handoffConfiguration);

    const verifiedUserInfo =
      (await decryptAndVerifySignedUserData(
        signedUserData,
        settings
      )) as VerifiedUserInfo;

    const { id: userId } = await getOrCreateZendeskUser(
      SunshineConversationsClient,
      verifiedUserInfo,
      zendeskConversationsAppId
    );

    const conversation = await getOrCreateZendeskConversation(
      SunshineConversationsClient,
      userId,
      zendeskConversationsAppId
    );

    const { id: conversationId } = conversation;

    await postMessagesToZendeskConversation(
      SunshineConversationsClient,
      conversationId,
      userId,
      zendeskConversationsAppId,
      messages
    );

    const token = jwt.sign(
      { scope: 'appUser', userId, conversationId },
      apiSecret,
      {
        keyid: apiKey,
      }
    );

    return NextResponse.json(
      { success: true },
      {
        headers: {
          [HANDOFF_AUTH_HEADER]: token,
        },
      }
    );
  });
}
