declare global {
  interface AppSettings {
    salesforceChatHostUrl: string;
    salesforceChatButtonId: string;
    salesforceDeploymentId: string;
    salesforceOrgId: string;
    salesforceEswLiveAgentDevName: string;
    zendeskConversationsApiKey: string;
    zendeskConversationsApiSecret: string;
    zendeskConversationsAppId: string;
    amplitudeApiKey: string;
    preferredLiveAgentProvider: string;
  }
}

export {};
