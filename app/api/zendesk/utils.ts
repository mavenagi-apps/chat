import * as SunshineConversationsClient from 'sunshine-conversations-client';

import { getAppSettings } from '@/app/api/utils';

export const getSunshineConversationsClient = async (orgFriendlyId: string, agentId: string): Promise<[SunshineConversationsClient, string]> => {
  const sunshineClient = SunshineConversationsClient.ApiClient.instance;
  sunshineClient.basePath = 'https://d3v-mavenagi.zendesk.com/sc';
  const { zendeskConversationsApiKey, zendeskConversationsApiSecret, zendeskConversationsAppId } = await getAppSettings(orgFriendlyId, agentId);
  sunshineClient.authentications['basicAuth'].username = zendeskConversationsApiKey;
  sunshineClient.authentications['basicAuth'].password = zendeskConversationsApiSecret;
  return [SunshineConversationsClient, zendeskConversationsAppId];
}
