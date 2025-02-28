/**
 * Parses a string value into a valid idle message timeout number.
 * Returns undefined if the value is invalid or not a positive integer.
 */
export function parseIdleMessageTimeout(value?: string): number | undefined {
  const timeout = parseInt(value || "", 10);
  return !isNaN(timeout) && timeout > 0 ? timeout : undefined;
}

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
    // TODO: Remove logoUrl once we have migrated all users to the new logo field
    logo:
      settings.branding?.logo ?? settings.branding?.logoUrl ?? settings.logoUrl,
    fallbackLogoUrl: settings.branding?.logoUrl ?? settings.logoUrl,
    brandColor: settings.branding?.brandColor ?? settings.brandColor,
    brandFontColor:
      settings.branding?.brandFontColor ?? settings.brandFontColor,
    welcomeMessage:
      settings.branding?.welcomeMessage ?? settings.welcomeMessage,
    popularQuestions:
      settings.branding?.popularQuestions ?? settings.popularQuestions,
  };

  // Set security properties
  adapted.security = {
    ...(adapted.security || {}),
    jwtPublicKey: settings.security?.jwtPublicKey ?? settings.jwtPublicKey,
    embedAllowlist:
      settings.security?.embedAllowlist ?? settings.embedAllowlist,
    encryptionSecret:
      settings.security?.encryptionSecret ?? settings.encryptionSecret,
    enablePreviewSite:
      settings.security?.enablePreviewSite ?? settings.enableDemoSite,
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
