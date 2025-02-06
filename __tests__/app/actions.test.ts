import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isHandoffAvailable } from "@/app/actions";
import { getAppSettings } from "@/app/api/server/utils";
import { ServerHandoffStrategyFactory } from "@/lib/handoff/ServerHandoffStrategyFactory";

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
