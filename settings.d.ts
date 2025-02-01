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
    surveyLink?: string;
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
    shiftNames?: string[];
  };
  type SalesforceHandoffConfiguration = {
    type: "salesforce";
    orgId: string;
    chatHostUrl: string;
    chatButtonId: string;
    deploymentId: string;
    eswLiveAgentDevName: string;
    allowAnonymousHandoff?: boolean;
    apiSecret: string;
    surveyLink?: string;
    enableAvailabilityCheck?: boolean;
    availabilityFallbackMessage?: string;
  };

  type HandoffConfiguration =
    | ZendeskHandoffConfiguration
    | FrontHandoffConfiguration
    | SalesforceHandoffConfiguration;

  interface ClientSafeAppSettings extends Partial<AppSettings> {
    handoffConfiguration?:
      | {
          type: HandoffConfiguration["type"];
          surveyLink?: string;
          enableAvailabilityCheck?: boolean;
          availabilityFallbackMessage?: string;
        }
      | undefined;
  }

  interface ParsedAppSettings extends AppSettings {
    handoffConfiguration?: HandoffConfiguration | undefined;
  }
}

export {};
