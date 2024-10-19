import { getSunshineConversationsClient } from '@/app/api/zendesk/utils';
import { type NextRequest, NextResponse } from 'next/server';

interface SunshineConversationsClient {
  UsersApi: new () => {
    getUser: (appId: string, email: string) => Promise<{ user: any }>;
    createUser: (appId: string, userCreateBody: any) => Promise<{ user: any }>;
  };
  UserCreateBody: new () => {
    setExternalId: (externalId: string) => void;
    setProfile: (profile: { givenName: string; surname: string; email: string; locale: string }) => void;
  };
  ConversationsApi: new () => {
    listConversations: (appId: string, params: { userId: string }) => Promise<{ conversations: any[] }>;
    createConversation: (appId: string, conversationCreateBody: any) => Promise<{ conversation: any }>;
  };
  ConversationCreateBody: new (type: string) => {
    setParticipants: (participants: { userId: string; subscribeSDKClient: boolean }[]) => void;
    setDisplayName: (displayName: string) => void;
    setDescription: (description: string) => void;
  };
  SwitchboardActionsApi: new () => {
    passControl: (appId: string, conversationId: string, switchboardIntegration: { switchboardIntegration: string }) => Promise<any>;
  };
  MessagesApi: new () => {
    postMessage: (appId: string, conversationId: string, message: any) => Promise<any>;
  };
}

interface UnverifiedUserInfo {
  firstName: string;
  lastName: string;
  email: string;
}

const getOrCreateZendeskUser = async (SunshineConversationsClient: SunshineConversationsClient, unverifiedUserInfo: UnverifiedUserInfo, appId: string) => {
  const apiInstance = new SunshineConversationsClient.UsersApi();

  if (unverifiedUserInfo.email) {
    const { user } = await apiInstance.getUser(appId, unverifiedUserInfo.email);
    if (user) {
      console.log('User already exists', user);
      return user;
    }
  }

  const userCreateBody = new SunshineConversationsClient.UserCreateBody();
  console.log(userCreateBody);
  userCreateBody.setExternalId(unverifiedUserInfo.email);
  userCreateBody.setProfile({
    givenName: unverifiedUserInfo.firstName,
    surname: unverifiedUserInfo.lastName,
    email: unverifiedUserInfo.email,
    locale: 'en-US',
  });
  console.log(userCreateBody);
  const { user } = await apiInstance.createUser(appId, userCreateBody);
  console.log('User created', user);
  return user;
}

const getOrCreateZendeskConversation = async (SunshineConversationsClient: SunshineConversationsClient, userId: string, appId: string) => {
  const apiInstance = new SunshineConversationsClient.ConversationsApi();

  // TODO: Check if conversation already exists
  const { conversations } = await apiInstance.listConversations(appId, { userId });
  if (conversations.length > 0) {
    console.log('Conversation already exists', conversations);
    return conversations[0];
  }

  const conversationCreateBody = new SunshineConversationsClient.ConversationCreateBody('personal');
  const participants = [{ userId, subscribeSDKClient: false }];
  conversationCreateBody.setParticipants(participants);
  conversationCreateBody.setDisplayName('Chat with Support');
  conversationCreateBody.setDescription(
    'A conversation for customer support inquiries.'
  );
  const { conversation } = await apiInstance.createConversation(appId, conversationCreateBody);
  return conversation;
}

const _passControlToAgent = async (SunshineConversationsClient: SunshineConversationsClient, conversationId: string, appId: string) => {
  const apiInstance = new SunshineConversationsClient.SwitchboardActionsApi();
  await apiInstance.passControl(appId, conversationId, { switchboardIntegration: 'next' });
}

const postMessagesToZendeskConversation = async (SunshineConversationsClient: SunshineConversationsClient, conversationId: string, userId: string, appId: string, messages: any[]) => {
  const apiInstance = new SunshineConversationsClient.MessagesApi();
  for (const mavenMessage of messages) {
    if (mavenMessage.author.type === 'user') {
      mavenMessage.author.userId = userId;
    }
    await apiInstance.postMessage(appId, conversationId, mavenMessage);
  }

  if (messages.length === 0) {
    const messagePost = {
      author: {
        type: 'user',
        userId,
      },
      content: {
        type: 'text',
        text: 'Maven AGI is handing off this conversation to a human agent but there was no message history to pass along.',
      },
    };
    await apiInstance.postMessage(appId, conversationId, messagePost);
  }
}

export async function POST(req: NextRequest) {
  const { orgFriendlyId, agentId, unverifiedUserInfo, messages } = await req.json();
  const [SunshineConversationsClient, zendeskConversationsAppId] = await getSunshineConversationsClient(orgFriendlyId, agentId);

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

  return NextResponse.json({ conversationId });
}
