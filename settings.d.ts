declare global {
  interface AppSettings {
    logoUrl: string;
    brandColor: string;
    brandFontColor?: string;
    amplitudeApiKey: string;
    popularQuestions: string[] | string;
    jwtPublicKey: string;
    encryptionSecret: string;
    handoffConfiguration?: string;
    embedAllowlist?: string[];
    enableDemoSite?: string;
    welcomeMessage?: string;
  }
  type BaseHandoffConfiguration = {
    apiKey: string;
    apiSecret: string;
    appId: string;
    allowAnonymousHandoff?: boolean;
  };
  type ZendeskHandoffConfiguration = BaseHandoffConfiguration & {
    type: "zendesk";
    webhookId: string;
    webhookSecret: string;
    subdomain: string;
  };
  type FrontHandoffConfiguration = BaseHandoffConfiguration & {
    type: "front";
    channelName: string;
    host?: string;
  };
  type SalesForceHandoffConfiguration = {
    type: "salesforce";
    orgId: string;
    chatHostUrl: string;
    chatButtonId: string;
    deploymentId: string;
    eswLiveAgentDevName: string;
    allowAnonymousHandoff?: boolean;
  };

  type HandoffConfiguration =
    | ZendeskHandoffConfiguration
    | FrontHandoffConfiguration
    | SalesForceHandoffConfiguration;

  interface ClientSafeAppSettings extends Partial<AppSettings> {
    handoffConfiguration?: { type: HandoffConfiguration["type"] } | undefined;
  }

  interface ParsedAppSettings extends AppSettings {
    handoffConfiguration?: HandoffConfiguration | undefined;
  }
}

export {};
