import * as SunshineConversationsClient from 'sunshine-conversations-client';
import type SunshineConversationsClientModule from 'sunshine-conversations-client';

import { getAppSettings } from '@/app/api/utils';

export const getSunshineConversationsClient = async (
  orgFriendlyId: string,
  agentId: string
): Promise<[typeof SunshineConversationsClient, string]> => {
  const sunshineClient = SunshineConversationsClient.ApiClient.instance;
  const {
    zendeskConversationsApiKey,
    zendeskConversationsApiSecret,
    zendeskConversationsAppId,
    zendeskConversationsClientBasePath,
  } = await getAppSettings(orgFriendlyId, agentId);
  sunshineClient.basePath = zendeskConversationsClientBasePath;
  sunshineClient.authentications['basicAuth'].username =
    zendeskConversationsApiKey;
  sunshineClient.authentications['basicAuth'].password =
    zendeskConversationsApiSecret;
  return [SunshineConversationsClient, zendeskConversationsAppId];
};

export const postMessagesToZendeskConversation = async (
  SunshineConversationsClient: typeof SunshineConversationsClientModule,
  conversationId: string,
  userId: string,
  appId: string,
  messages: any[]
) => {
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
        type: 'business',
        userId,
      },
      content: {
        type: 'text',
        text: 'Maven AGI is handing off this conversation to a human agent but there was no message history to pass along.',
      },
    };
    await apiInstance.postMessage(appId, conversationId, messagePost);
  }
};