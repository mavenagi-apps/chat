import type { CustomField } from "@magi/lib/handoff/types";

declare global {
  // Legacy AppSettings interface kept for reference during migration
  interface LegacyAppSettings {
    /** @deprecated Use AppSettings.branding.logo instead */
    logoUrl?: string;
    /** @deprecated Use AppSettings.branding.brandColor instead */
    brandColor?: string;
    /** @deprecated Use AppSettings.branding.brandFontColor instead */
    brandFontColor?: string;
    /** @deprecated Use AppSettings.misc.amplitudeApiKey instead */
    amplitudeApiKey?: string;
    /** @deprecated Use AppSettings.branding.popularQuestions instead */
    popularQuestions?: string[] | string;
    /** @deprecated Use AppSettings.security.jwtPublicKey instead */
    jwtPublicKey?: string;
    /** @deprecated Use AppSettings.security.encryptionSecret instead */
    encryptionSecret?: string;
    /** @deprecated Use AppSettings.misc.handoffConfiguration instead */
    handoffConfiguration?: string;
    /** @deprecated Use AppSettings.security.embedAllowlist instead */
    embedAllowlist?: string[];
    /** @deprecated Use AppSettings.security.enablePreviewSite instead */
    enableDemoSite?: string;
    /** @deprecated Use AppSettings.branding.welcomeMessage instead */
    welcomeMessage?: string;
    /** @deprecated Use AppSettings.misc.disableAttachments instead */
    disableAttachments?: string;
  }

  interface AppSettings {
    branding: {
      /** @deprecated Use logo instead */
      logoUrl?: string;
      /** @deprecated Use logo instead */
      fallbackLogoUrl?: string;
      logo?: string;
      brandColor?: string;
      brandFontColor?: string;
      welcomeMessage?: string;
      popularQuestions?: string[] | string;
    };
    security: {
      jwtPublicKey?: string;
      embedAllowlist?: string[];
      encryptionSecret?: string;
      enablePreviewSite?: string;
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
    enableAvailabilityCheck?: boolean;
    availabilityCheckApiEmail?: string;
    availabilityCheckApiToken?: string;
    customFields?: CustomField[];
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
    handoffTerminatingMessageText?: string;
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
    | "type"
    | "surveyLink"
    | "enableAvailabilityCheck"
    | "allowAnonymousHandoff"
    | "handoffTerminatingMessageText"
  > &
    Pick<ZendeskHandoffConfiguration, "customFields"> & {
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
