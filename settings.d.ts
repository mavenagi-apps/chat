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
    zendeskConversationsClientBasePath: string;
    amplitudeApiKey: string;
    preferredLiveAgentProvider: string;
    zendeskChatIntegrationId: string;
    zendeskSubdomain: string;
    escalationTopics: string;
    logoUrl: string;
    popularQuestions: string;
    defaultAgentName: string;
    brandColor: string;
    surveyLink: string;
  }
}

export {};
