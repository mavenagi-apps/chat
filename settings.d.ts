declare global {
  interface AppSettings {
    logoUrl: string;
    brandColor: string;
    amplitudeApiKey: string;
    popularQuestions: string;
    jwtPublicKey: string;
    encryptionSecret: string;
  }
}

export {};
