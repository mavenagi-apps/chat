declare global {
  interface AppSettings {
    logoUrl: string;
    brandColor: string;
    amplitudeApiKey: string;
    popularQuestions: string;
    jwtPublicKey: string;
    encryptionSecret: string;
    handoffConfiguration: Record<string, unknown> & { type: 'zendesk' | 'salesforce' };
  }
}

export {};
