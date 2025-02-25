import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isHandoffAvailable, getPublicAppSettings } from "@/app/actions";
import { getAppSettings } from "@/app/api/server/utils";
import { ServerHandoffStrategyFactory } from "@/lib/handoff/ServerHandoffStrategyFactory";
import { getMavenAGIClient } from "@/app";

vi.mock("@/app", () => ({
  getMavenAGIClient: vi.fn(),
}));

vi.mock("@/app/api/server/utils", () => ({
  getAppSettings: vi.fn(),
}));

vi.mock("@/lib/handoff/ServerHandoffStrategyFactory", () => ({
  ServerHandoffStrategyFactory: {
    createStrategy: vi.fn(),
  },
}));

describe("isHandoffAvailable", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("console", { ...console, error: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns true when no strategy is available", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          type: "unknown",
        },
      },
    } as any);

    vi.mocked(ServerHandoffStrategyFactory.createStrategy).mockReturnValue(
      null,
    );

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toBe(true);
  });

  it("returns true when strategy has no availability check", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          type: "salesforce",
        },
      },
    } as any);

    vi.mocked(ServerHandoffStrategyFactory.createStrategy).mockReturnValue({
      fetchHandoffAvailability: undefined,
    });

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toBe(true);
  });

  it("returns availability check result when available", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          type: "salesforce",
        },
      },
    } as any);

    vi.mocked(ServerHandoffStrategyFactory.createStrategy).mockReturnValue({
      fetchHandoffAvailability: vi.fn().mockResolvedValue(false),
    });

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toBe(false);
  });

  it("returns true on error during availability check", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          type: "salesforce",
        },
      },
    } as any);

    vi.mocked(ServerHandoffStrategyFactory.createStrategy).mockReturnValue({
      fetchHandoffAvailability: vi
        .fn()
        .mockRejectedValue(new Error("Test error")),
    });

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toBe(true);
    expect(console.error).toHaveBeenCalledWith(
      "Error checking handoff availability:",
      expect.any(Error),
    );
  });

  it("passes configuration to strategy factory", async () => {
    const config = {
      type: "salesforce",
      enableAvailabilityCheck: true,
    };

    vi.mocked(getAppSettings).mockResolvedValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: config,
      },
    } as any);

    vi.mocked(ServerHandoffStrategyFactory.createStrategy).mockReturnValue({
      fetchHandoffAvailability: vi.fn().mockResolvedValue(true),
    });

    await isHandoffAvailable("org-id", "agent-id");

    expect(ServerHandoffStrategyFactory.createStrategy).toHaveBeenCalledWith(
      config.type,
      config,
    );
  });
});

describe("getPublicAppSettings", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("console", { ...console, error: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns null when organizationId is missing", async () => {
    const result = await getPublicAppSettings("", "agent-id");
    expect(result).toBeNull();
  });

  it("returns null when agentId is missing", async () => {
    const result = await getPublicAppSettings("org-id", "");
    expect(result).toBeNull();
  });

  it("transforms settings correctly", async () => {
    const mockClient = {
      appSettings: {
        get: vi.fn().mockResolvedValue({
          branding: {
            logo: "logo.png",
            brandColor: "#000",
          },
          security: {
            embedAllowlist: ["domain.com"],
          },
          misc: {
            amplitudeApiKey: "test-key",
            disableAttachments: "true",
            idleMessageTimeout: "30000",
            handoffConfiguration: JSON.stringify({
              type: "salesforce",
              enableAvailabilityCheck: true,
              surveyLink: "survey.com",
              availabilityFallbackMessage: "message",
              allowAnonymousHandoff: true,
              handoffTerminatingMessageText: "goodbye",
              apiSecret: "secret", // This should not be included in client settings
            }),
          },
        }),
      },
    };

    vi.mocked(getMavenAGIClient).mockReturnValue(mockClient as any);

    const result = await getPublicAppSettings("org-id", "agent-id");

    expect(result).toEqual({
      branding: {
        logo: "logo.png",
        brandColor: "#000",
      },
      security: {
        embedAllowlist: ["domain.com"],
      },
      misc: {
        amplitudeApiKey: "test-key",
        disableAttachments: true,
        idleMessageTimeout: 30000,
        handoffConfiguration: {
          type: "salesforce",
          enableAvailabilityCheck: true,
          surveyLink: "survey.com",
          availabilityFallbackMessage: "message",
          allowAnonymousHandoff: true,
          handoffTerminatingMessageText: "goodbye",
        },
      },
    });
  });

  describe("idleMessageTimeout parsing", () => {
    it.each([
      ["30000", 30000],
      ["1000", 1000],
      ["0", undefined],
      ["-1000", undefined],
      ["invalid", undefined],
      ["", undefined],
      [undefined, undefined],
    ])("parses idleMessageTimeout %s as %s", async (input, expected) => {
      const mockClient = {
        appSettings: {
          get: vi.fn().mockResolvedValue({
            branding: {},
            security: {},
            misc: {
              idleMessageTimeout: input,
            },
          }),
        },
      };

      vi.mocked(getMavenAGIClient).mockReturnValue(mockClient as any);

      const result = await getPublicAppSettings("org-id", "agent-id");
      expect(result?.misc.idleMessageTimeout).toBe(expected);
    });
  });

  describe("disableAttachments parsing", () => {
    it.each([
      ["true", true],
      ["1", true],
      ["false", false],
      ["0", false],
      ["", false],
      [undefined, false],
      ["anything-else", false],
    ])("parses disableAttachments %s as %s", async (input, expected) => {
      const mockClient = {
        appSettings: {
          get: vi.fn().mockResolvedValue({
            branding: {},
            security: {},
            misc: {
              disableAttachments: input,
            },
          }),
        },
      };

      vi.mocked(getMavenAGIClient).mockReturnValue(mockClient as any);

      const result = await getPublicAppSettings("org-id", "agent-id");
      expect(result?.misc.disableAttachments).toBe(expected);
    });
  });

  it("handles invalid handoff configuration", async () => {
    const mockClient = {
      appSettings: {
        get: vi.fn().mockResolvedValue({
          branding: {},
          security: {},
          misc: {
            handoffConfiguration: "invalid-json",
          },
        }),
      },
    };

    vi.mocked(getMavenAGIClient).mockReturnValue(mockClient as any);

    const result = await getPublicAppSettings("org-id", "agent-id");

    expect(result?.misc.handoffConfiguration).toBeUndefined();
    expect(console.error).toHaveBeenCalledWith(
      "Error parsing handoff configuration:",
      expect.any(Error),
    );
  });

  it("returns null on error", async () => {
    const mockClient = {
      appSettings: {
        get: vi.fn().mockRejectedValue(new Error("Failed to fetch")),
      },
    };

    vi.mocked(getMavenAGIClient).mockReturnValue(mockClient as any);

    const result = await getPublicAppSettings("org-id", "agent-id");

    expect(result).toBeNull();
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching app settings:",
      expect.any(Error),
    );
  });
});
