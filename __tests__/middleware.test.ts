import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "@/middleware";
import { getAppSettings } from "@/app/api/server/utils";

vi.mock("@/app/api/server/utils", () => ({
  getAppSettings: vi.fn().mockResolvedValue({
    security: {
      embedAllowlist: [],
    },
    branding: {
      enableDemoSite: "false",
    },
    misc: {},
  }),
}));

describe("Middleware", () => {
  beforeEach(async () => {
    vi.clearAllMocks();
  });

  const createMockRequest = (
    url: string,
    headers: Record<string, string> = {},
  ) => {
    return new NextRequest(new URL(url, "https://example.com"), {
      headers: new Headers(headers),
    });
  };

  describe("Path parameter extraction", () => {
    it("should extract organizationId and agentId from demo path", async () => {
      const request = createMockRequest("/demo/org123/agent456", {
        "sec-fetch-dest": "iframe",
      });
      await middleware(request);

      expect(getAppSettings).toHaveBeenCalledWith("org123", "agent456");
    });

    it("should extract organizationId and agentId from regular path", async () => {
      const request = createMockRequest("/org123/agent456", {
        "sec-fetch-dest": "iframe",
      });
      await middleware(request);

      expect(getAppSettings).toHaveBeenCalledWith("org123", "agent456");
    });
  });

  describe("Security headers", () => {
    const testCases = [
      {
        name: "iframe + navigate + allowed referrer + CSP enabled",
        fetchDest: "iframe",
        fetchMode: "navigate",
        referrer: "https://allowed-domain.com",
        cspDisabled: false,
        expected: {
          cspHeader: true,
          blocked: false,
        },
      },
      {
        name: "iframe + other + allowed referrer + CSP enabled",
        fetchDest: "iframe",
        fetchMode: "other",
        referrer: "https://allowed-domain.com",
        cspDisabled: false,
        expected: {
          cspHeader: true,
          blocked: false,
        },
      },
      {
        name: "iframe + navigate + unauthorized referrer + CSP enabled",
        fetchDest: "iframe",
        fetchMode: "navigate",
        referrer: "https://unauthorized-domain.com",
        cspDisabled: false,
        expected: {
          cspHeader: true,
          blocked: false,
        },
      },
      {
        name: "iframe + other + unauthorized referrer + CSP enabled",
        fetchDest: "iframe",
        fetchMode: "other",
        referrer: "https://unauthorized-domain.com",
        cspDisabled: false,
        expected: {
          cspHeader: true,
          blocked: true,
        },
      },
      {
        name: "document + navigate + allowed referrer + CSP enabled",
        fetchDest: "document",
        fetchMode: "navigate",
        referrer: "https://allowed-domain.com",
        cspDisabled: false,
        expected: {
          cspHeader: true,
          blocked: false,
        },
      },
      {
        name: "other + navigate + allowed referrer + CSP enabled",
        fetchDest: "image",
        fetchMode: "navigate",
        referrer: "https://allowed-domain.com",
        cspDisabled: false,
        expected: {
          cspHeader: false,
          blocked: false,
        },
      },
      {
        name: "iframe + navigate + allowed referrer + CSP disabled",
        fetchDest: "iframe",
        fetchMode: "navigate",
        referrer: "https://allowed-domain.com",
        cspDisabled: true,
        expected: {
          cspHeader: false,
          blocked: false,
        },
      },
    ];

    testCases.forEach(
      ({ name, fetchDest, fetchMode, referrer, cspDisabled, expected }) => {
        describe(name, () => {
          beforeEach(() => {
            (getAppSettings as ReturnType<typeof vi.fn>).mockResolvedValue({
              security: {
                embedAllowlist: ["allowed-domain.com"],
              },
              branding: {
                enableDemoSite: "false",
              },
              misc: {},
            });
            if (cspDisabled) {
              vi.stubEnv("ORGANIZATIONS_WITH_CSP_DISABLED", "org123,secondOrg");
            }
          });

          afterEach(() => {
            if (cspDisabled) {
              vi.unstubAllEnvs();
            }
          });

          it("should handle security settings correctly", async () => {
            const request = createMockRequest("/org123/agent456", {
              "sec-fetch-dest": fetchDest,
              "sec-fetch-mode": fetchMode,
              referer: referrer,
            });

            const response = await middleware(request);

            if (expected.cspHeader) {
              expect(
                response.headers.get("Content-Security-Policy"),
              ).toBeDefined();
            } else {
              expect(
                response.headers.get("Content-Security-Policy"),
              ).toBeNull();
            }

            if (expected.blocked) {
              expect(response.status).toBe(404);
            } else {
              expect(response.status).not.toBe(404);
            }
          });
        });
      },
    );
  });

  describe("Cache headers", () => {
    it("should set correct cache headers for valid requests", async () => {
      const request = createMockRequest("/org123/agent456", {
        "sec-fetch-dest": "iframe",
        "sec-fetch-mode": "navigate",
      });

      const response = await middleware(request);
      expect(response.headers.get("Cache-Control")).toBe(
        "public, max-age=900, stale-while-revalidate=60",
      );
    });
  });

  describe("Request filtering", () => {
    it("should skip processing for non-iframe/document requests", async () => {
      const request = createMockRequest("/org123/agent456", {
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "navigate",
      });

      const response = await middleware(request);
      expect(getAppSettings).not.toHaveBeenCalled();
      expect(response.headers.get("Content-Security-Policy")).toBeNull();
    });
  });
});
