import * as SunshineConversationsClient from 'sunshine-conversations-client';
import type SunshineConversationsClientModule from 'sunshine-conversations-client';

export const getSunshineConversationsClient = async (
  handoffConfiguration: HandoffConfiguration
): Promise<[typeof SunshineConversationsClient, string]> => {
  const sunshineClient = SunshineConversationsClient.ApiClient.instance;
  if (!handoffConfiguration) {
    throw new Error('Handoff configuration not found');
  }
  try {
    sunshineClient.basePath = `https://${handoffConfiguration.subdomain}.zendesk.com/sc`;
    sunshineClient.authentications['basicAuth'].username =
      handoffConfiguration.apiKey;
    sunshineClient.authentications['basicAuth'].password =
      handoffConfiguration.apiSecret;
    return [SunshineConversationsClient, handoffConfiguration.appId];
  } catch (e) {
    throw new Error('Invalid handoff configuration', { cause: e });
  }
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