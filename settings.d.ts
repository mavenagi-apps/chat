declare global {
  // Legacy AppSettings interface kept for reference during migration
  interface LegacyAppSettings {
    logoUrl?: string;
    brandColor?: string;
    brandFontColor?: string;
    amplitudeApiKey?: string;
    popularQuestions?: string[] | string;
    jwtPublicKey?: string;
    encryptionSecret?: string;
    handoffConfiguration?: string;
    embedAllowlist?: string[];
    enablePreviewSite?: string;
    welcomeMessage?: string;
    disableAttachments?: string;
  }

  interface AppSettings {
    branding: {
      logoUrl?: string;
      brandColor?: string;
      brandFontColor?: string;
      welcomeMessage?: string;
      popularQuestions?: string[] | string;
      enablePreviewSite?: string;
    };
    security: {
      jwtPublicKey?: string;
      embedAllowlist?: string[];
      encryptionSecret?: string;
    };
    misc: {
      handoffConfiguration?: string;
      amplitudeApiKey?: string;
      disableAttachments?: string;
      idleMessageTimeout?: string;
    };
  }

  interface InterimAppSettings extends LegacyAppSettings, AppSettings {}

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

  interface ParsedAppSettings extends Omit<AppSettings, "misc"> {
    misc: AppSettings["misc"] & {
      handoffConfiguration: HandoffConfiguration;
    };
  }

  type ClientSafeHandoffConfig = Pick<
    HandoffConfiguration,
    "type" | "surveyLink" | "enableAvailabilityCheck" | "allowAnonymousHandoff"
  > & {
    availabilityFallbackMessage?: SalesforceHandoffConfiguration["availabilityFallbackMessage"];
  };

  interface ClientSafeAppSettings {
    branding: AppSettings["branding"];
    security: {
      embedAllowlist?: AppSettings["security"]["embedAllowlist"];
    };
    misc: {
      amplitudeApiKey?: AppSettings["misc"]["amplitudeApiKey"];
      disableAttachments?: boolean;
      handoffConfiguration?: ClientSafeHandoffConfig;
      idleMessageTimeout?: number;
    };
  }
}

export {};
