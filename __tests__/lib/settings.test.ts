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
      disableAttachments: true,
      branding: {},
      security: {},
      misc: {},
    };

    const result = adaptLegacySettings(legacySettings);

    expect(result).toEqual({
      branding: {
        logoUrl: "legacy-logo.png",
        brandColor: "#legacy",
        brandFontColor: "#legacyFont",
        welcomeMessage: "legacy-welcome",
        popularQuestions: ["q1", "q2"],
        enableDemoSite: "true",
      },
      security: {
        jwtPublicKey: "legacy-jwt",
        embedAllowList: ["legacy-domain"],
        encryptionSecret: "legacy-secret",
      },
      misc: {
        handoffConfiguration: "legacy-handoff",
        amplitudeApiKey: "legacy-key",
        disableAttachments: true,
      },
    });
  });

  it("prefers nested properties over legacy ones", () => {
    const settings = {
      logoUrl: "legacy-logo.png",
      branding: {
        logoUrl: "new-logo.png",
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

    expect(result.branding.logoUrl).toBe("new-logo.png");
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
        logoUrl: "logo.png",
        brandColor: undefined,
        brandFontColor: undefined,
        welcomeMessage: undefined,
        popularQuestions: undefined,
        enableDemoSite: undefined,
      },
      security: {
        jwtPublicKey: undefined,
        embedAllowList: undefined,
        encryptionSecret: undefined,
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
        logoUrl: undefined,
        brandColor: undefined,
        brandFontColor: undefined,
        welcomeMessage: undefined,
        popularQuestions: undefined,
        enableDemoSite: undefined,
      },
      security: {
        jwtPublicKey: undefined,
        embedAllowList: undefined,
        encryptionSecret: undefined,
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
});
