declare global {
  interface AppSettings {
    salesforceChatHostUrl: string;
    salesforceChatButtonId: string;
    salesforceDeploymentId: string;
    salesforceOrgId: string;
    salesforceEswLiveAgentDevName: string;
    zendeskChatAccountKey: string;
    amplitudeApiKey: string;
    preferredLiveAgentProvider: string;
  }
}

export {};
