import { describe, it, expect, vi, beforeEach } from "vitest";
import { isHandoffAvailable } from "@/app/actions";
import { getAppSettings } from "@/app/api/server/utils";

vi.mock("@/app/api/server/utils", () => ({
  getAppSettings: vi.fn(),
}));

describe("isHandoffAvailable", () => {
  const mockFetch = vi.fn();
  global.fetch = mockFetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns undefined when handoff configuration is not salesforce", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      handoffConfiguration: {
        type: "zendesk",
      },
    } as any);

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("returns undefined when availability check is disabled", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      handoffConfiguration: {
        type: "salesforce",
        enableAvailabilityCheck: false,
      },
    } as any);

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("returns undefined on fetch error", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      handoffConfiguration: {
        type: "salesforce",
        enableAvailabilityCheck: true,
        chatHostUrl: "https://test.com",
        orgId: "org-id",
        deploymentId: "dep-id",
        chatButtonId: "button-id",
      },
    } as any);

    mockFetch.mockRejectedValue(new Error("Network error"));

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("returns undefined on non-200 response", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      handoffConfiguration: {
        type: "salesforce",
        enableAvailabilityCheck: true,
        chatHostUrl: "https://test.com",
        orgId: "org-id",
        deploymentId: "dep-id",
        chatButtonId: "button-id",
      },
    } as any);

    mockFetch.mockResolvedValue({
      ok: false,
    });

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toEqual({ success: true, data: undefined });
  });

  it("returns false when agents are not available", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      handoffConfiguration: {
        type: "salesforce",
        enableAvailabilityCheck: true,
        chatHostUrl: "https://test.com",
        orgId: "org-id",
        deploymentId: "dep-id",
        chatButtonId: "button-id",
      },
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            {
              type: "Availability",
              message: {
                results: [
                  {
                    id: "button-id",
                    isAvailable: false,
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toEqual({ success: true, data: false });
  });

  it("returns true when agents are available", async () => {
    vi.mocked(getAppSettings).mockResolvedValue({
      handoffConfiguration: {
        type: "salesforce",
        enableAvailabilityCheck: true,
        chatHostUrl: "https://test.com",
        orgId: "org-id",
        deploymentId: "dep-id",
        chatButtonId: "button-id",
      },
    } as any);

    mockFetch.mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          messages: [
            {
              type: "Availability",
              message: {
                results: [
                  {
                    id: "button-id",
                    isAvailable: true,
                  },
                ],
              },
            },
          ],
        }),
    });

    const result = await isHandoffAvailable("org-id", "agent-id");
    expect(result).toEqual({ success: true, data: true });
  });
});
