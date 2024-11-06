import type * as SunshineConversationsClientModule from 'sunshine-conversations-client';

import { getSunshineConversationsClient, postMessagesToZendeskConversation } from '@/app/api/zendesk/utils';
import { getAppSettings } from '@/app/api/utils';
import { type NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

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
        console.log('User already exists', user);
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
  console.log('User created', user);
  return user;
};

const getOrCreateZendeskConversation = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  userId: string,
  appId: string
) => {
  const apiInstance = new SunshineConversationsClient.ConversationsApi();

  // TODO: Check if conversation already exists
  const { conversations } = await apiInstance.listConversations(appId, {
    userId,
  });
  if (conversations.length > 0) {
    console.log('Conversation already exists', conversations);
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
  const { orgFriendlyId, agentId, unverifiedUserInfo, messages } =
    await req.json();
  const [SunshineConversationsClient, zendeskConversationsAppId] =
    await getSunshineConversationsClient(orgFriendlyId, agentId);

  const { id: userId } = await getOrCreateZendeskUser(
    SunshineConversationsClient,
    unverifiedUserInfo,
    zendeskConversationsAppId
  );

  const { id: conversationId } = await getOrCreateZendeskConversation(
    SunshineConversationsClient,
    userId,
    zendeskConversationsAppId
  );

  await postMessagesToZendeskConversation(
    SunshineConversationsClient,
    conversationId,
    userId,
    zendeskConversationsAppId,
    messages
  );

  const { zendeskConversationsApiSecret, zendeskConversationsApiKey } =
    await getAppSettings(orgFriendlyId, agentId);
  const token = jwt.sign(
    { scope: 'appUser', userId: unverifiedUserInfo.email },
    zendeskConversationsApiSecret,
    {
      keyid: zendeskConversationsApiKey,
    }
  );

  return NextResponse.json({ conversationId, userId, jwt: token });
}
