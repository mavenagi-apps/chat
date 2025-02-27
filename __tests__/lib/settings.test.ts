import { describe, it, expect } from "vitest";
import { adaptLegacySettings } from "@/lib/settings";

describe("adaptLegacySettings", () => {
  it("transforms legacy settings to new format", () => {
    const legacySettings = {
      logoUrl: "legacy-logo.png",
      brandColor: "#legacy",
      brandFontColor: "#legacyFont",
      amplitudeApiKey: "legacy-key",
      popularQuestions: ["q1", "q2"],
      jwtPublicKey: "legacy-jwt",
      encryptionSecret: "legacy-secret",
      handoffConfiguration: "legacy-handoff",
      embedAllowlist: ["legacy-domain"],
      enableDemoSite: "true",
      welcomeMessage: "legacy-welcome",
      disableAttachments: "true",
      branding: {},
      security: {},
      misc: {},
    };

    const result = adaptLegacySettings(legacySettings);

    expect(result).toEqual({
      branding: {
        logo: "legacy-logo.png",
        fallbackLogoUrl: "legacy-logo.png",
        brandColor: "#legacy",
        brandFontColor: "#legacyFont",
        welcomeMessage: "legacy-welcome",
        popularQuestions: ["q1", "q2"],
      },
      security: {
        jwtPublicKey: "legacy-jwt",
        embedAllowlist: ["legacy-domain"],
        encryptionSecret: "legacy-secret",
        enablePreviewSite: "true",
      },
      misc: {
        handoffConfiguration: "legacy-handoff",
        amplitudeApiKey: "legacy-key",
        disableAttachments: "true",
      },
    });
  });

  it("prefers nested properties over legacy ones", () => {
    const settings = {
      logoUrl: "legacy-logo.png",
      branding: {
        logo: "new-logo.png",
        logoUrl: "branding-legacy-logo.png",
        brandColor: "#new",
      },
      security: {
        jwtPublicKey: "new-jwt",
      },
      misc: {
        amplitudeApiKey: "new-key",
      },
    };

    const result = adaptLegacySettings(settings);

    expect(result.branding.logo).toBe("new-logo.png");
    expect(result.branding.fallbackLogoUrl).toBe("branding-legacy-logo.png");
    expect(result.security.jwtPublicKey).toBe("new-jwt");
    expect(result.misc.amplitudeApiKey).toBe("new-key");
  });

  it("handles missing sections gracefully", () => {
    const settings = {
      logoUrl: "logo.png",
      branding: {},
      security: {},
      misc: {},
    };

    const result = adaptLegacySettings(settings);

    expect(result).toEqual({
      branding: {
        logo: "logo.png",
        fallbackLogoUrl: "logo.png",
        brandColor: undefined,
        brandFontColor: undefined,
        welcomeMessage: undefined,
        popularQuestions: undefined,
      },
      security: {
        jwtPublicKey: undefined,
        embedAllowlist: undefined,
        encryptionSecret: undefined,
        enablePreviewSite: undefined,
      },
      misc: {
        handoffConfiguration: undefined,
        amplitudeApiKey: undefined,
        disableAttachments: undefined,
      },
    });
  });

  it("handles empty input", () => {
    const settings = {
      branding: {},
      security: {},
      misc: {},
    };

    const result = adaptLegacySettings(settings);

    expect(result).toEqual({
      branding: {
        logo: undefined,
        fallbackLogoUrl: undefined,
        brandColor: undefined,
        brandFontColor: undefined,
        welcomeMessage: undefined,
        popularQuestions: undefined,
      },
      security: {
        jwtPublicKey: undefined,
        embedAllowlist: undefined,
        encryptionSecret: undefined,
        enablePreviewSite: undefined,
      },
      misc: {
        handoffConfiguration: undefined,
        amplitudeApiKey: undefined,
        disableAttachments: undefined,
      },
    });
  });

  it("preserves array types for popularQuestions", () => {
    const settings = {
      popularQuestions: ["q1", "q2"],
      branding: {
        popularQuestions: ["q3", "q4"],
      },
      security: {},
      misc: {},
    };

    const result = adaptLegacySettings(settings);

    expect(Array.isArray(result.branding.popularQuestions)).toBe(true);
    expect(result.branding.popularQuestions).toEqual(["q3", "q4"]);
  });

  it("handles string type for popularQuestions", () => {
    const settings = {
      popularQuestions: "q1,q2",
      branding: {
        popularQuestions: "q3,q4",
      },
      security: {},
      misc: {},
    };

    const result = adaptLegacySettings(settings);

    expect(result.branding.popularQuestions).toBe("q3,q4");
  });

  it("correctly adapts embedAllowlist from both legacy and new formats", () => {
    const legacySettings = {
      embedAllowlist: ["legacy.com"],
      security: {
        embedAllowlist: ["new.com"],
      },
      branding: {},
      misc: {},
    };

    const result = adaptLegacySettings(legacySettings);

    expect(result.security.embedAllowlist).toEqual(["new.com"]);

    const legacyOnlySettings = {
      embedAllowlist: ["legacy.com"],
      security: {},
      branding: {},
      misc: {},
    };

    const legacyResult = adaptLegacySettings(legacyOnlySettings);

    expect(legacyResult.security.embedAllowlist).toEqual(["legacy.com"]);
  });

  it("handles logo field migration correctly", () => {
    const testCases = [
      {
        input: {
          logoUrl: "legacy.png",
          branding: { logo: "new.png" },
          security: {},
          misc: {},
        },
        expected: "new.png",
        expectedFallback: "legacy.png",
        description: "prefers branding.logo over legacy logoUrl",
      },
      {
        input: {
          logoUrl: "legacy.png",
          branding: { logoUrl: "branding-legacy.png" },
          security: {},
          misc: {},
        },
        expected: "branding-legacy.png",
        expectedFallback: "branding-legacy.png",
        description: "prefers branding.logoUrl over legacy logoUrl",
      },
      {
        input: {
          logoUrl: "legacy.png",
          branding: {},
          security: {},
          misc: {},
        },
        expected: "legacy.png",
        expectedFallback: "legacy.png",
        description: "falls back to legacy logoUrl",
      },
      {
        input: {
          branding: { logo: "new.png", logoUrl: "old.png" },
          security: {},
          misc: {},
        },
        expected: "new.png",
        expectedFallback: "old.png",
        description: "prefers logo over logoUrl in branding",
      },
    ];

    testCases.forEach(({ input, expected, expectedFallback, description }) => {
      const result = adaptLegacySettings(input);
      expect(result.branding.logo, description).toBe(expected);
      expect(result.branding.fallbackLogoUrl, `fallback: ${description}`).toBe(
        expectedFallback,
      );
    });
  });

  it("sets fallbackLogoUrl correctly", () => {
    const testCases = [
      {
        input: {
          logoUrl: "legacy.png",
          branding: {
            logo: "primary.png",
            logoUrl: "secondary.png",
          },
          security: {},
          misc: {},
        },
        expected: "secondary.png",
        description:
          "uses branding.logoUrl as fallback when no explicit fallback",
      },
      {
        input: {
          logoUrl: "legacy.png",
          branding: {
            logo: "primary.png",
          },
          security: {},
          misc: {},
        },
        expected: "legacy.png",
        description: "uses legacy logoUrl when no other fallback options",
      },
    ];

    testCases.forEach(({ input, expected, description }) => {
      const result = adaptLegacySettings(input);
      expect(result.branding.fallbackLogoUrl, description).toBe(expected);
    });
  });
});
