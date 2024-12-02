declare global {
  interface AppSettings {
    logoUrl?: string;
    brandColor?: string;
    brandFontColor?: string;
    amplitudeApiKey?: string;
    popularQuestions?: string;
    jwtPublicKey?: string;
    encryptionSecret?: string;
    embedAllowlist?: string[];
    enableDemoSite?: string;
  }
}

export {};
