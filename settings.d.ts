declare global {
  interface AppSettings {
    logoUrl: string;
    brandColor: string;
    brandFontColor?: string;
    amplitudeApiKey: string;
    popularQuestions: string;
    jwtPublicKey: string;
    encryptionSecret: string;
    handoffConfiguration?: string;
    embedAllowlist?: string[];
    enableDemoSite?: string;
  }

  type HandoffConfiguration = {
    type: 'zendesk' | 'salesforce';
    subdomain: string;
    apiKey: string;
    apiSecret: string;
    appId: string;
  };

  interface ClientSafeAppSettings extends Partial<AppSettings> {
    handoffConfiguration?: { type: HandoffConfiguration['type'] } | undefined;
  }

  interface ParsedAppSettings extends AppSettings {
    handoffConfiguration?: HandoffConfiguration | undefined;
  }
}

export {};
