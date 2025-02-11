export function adaptLegacySettings(settings: InterimAppSettings): AppSettings {
  const { misc, branding, security } = settings;

  const adapted: AppSettings = {
    branding: { ...(branding || {}) },
    security: { ...(security || {}) },
    misc: { ...(misc || {}) },
  };

  // Set branding properties
  adapted.branding = {
    ...(adapted.branding || {}),
    logoUrl: settings.branding?.logoUrl ?? settings.logoUrl,
    brandColor: settings.branding?.brandColor ?? settings.brandColor,
    brandFontColor:
      settings.branding?.brandFontColor ?? settings.brandFontColor,
    welcomeMessage:
      settings.branding?.welcomeMessage ?? settings.welcomeMessage,
    popularQuestions:
      settings.branding?.popularQuestions ?? settings.popularQuestions,
    enableDemoSite:
      settings.branding?.enableDemoSite ?? settings.enableDemoSite,
  };

  // Set security properties
  adapted.security = {
    ...(adapted.security || {}),
    jwtPublicKey: settings.security?.jwtPublicKey ?? settings.jwtPublicKey,
    embedAllowlist:
      settings.security?.embedAllowlist ?? settings.embedAllowlist,
    encryptionSecret:
      settings.security?.encryptionSecret ?? settings.encryptionSecret,
  };

  adapted.misc = {
    ...(adapted.misc || {}),
    handoffConfiguration:
      settings.misc?.handoffConfiguration ?? settings.handoffConfiguration,
    amplitudeApiKey: settings.misc?.amplitudeApiKey ?? settings.amplitudeApiKey,
    disableAttachments:
      settings.misc?.disableAttachments ?? settings.disableAttachments,
  };

  return adapted;
}
