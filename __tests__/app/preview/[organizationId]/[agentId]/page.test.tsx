import { render } from "@testing-library/react";
import PreviewPage from "@/app/preview/[organizationId]/[agentId]/page";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { headers } from "next/headers";
import { getPublicAppSettings } from "@/app/actions";
import { generateSignedUserData } from "@/app/preview/[organizationId]/[agentId]/actions";
import { notFound } from "next/navigation";

// Mock the dependencies
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/app/actions", () => ({
  getPublicAppSettings: vi.fn(),
}));

vi.mock("@/app/preview/[organizationId]/[agentId]/actions", () => ({
  generateSignedUserData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock the background image import
vi.mock("@/assets/background/bg.jpg", () => ({
  default: { src: "/mock-bg-image.jpg" },
}));

describe("PreviewPage", () => {
  const mockParams = {
    organizationId: "test-org",
    agentId: "test-agent",
  };

  type SearchParams = {
    authenticated?: string;
    customContext?: string;
    customData?: string;
  };

  const mockHeaders = new Headers();
  mockHeaders.set("x-magi-env-prefix", "test-prefix");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(mockHeaders);
    vi.mocked(getPublicAppSettings).mockResolvedValue({
      branding: {
        brandColor: "#123456",
      },
      security: {},
      misc: {},
    });
    vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when all parameters are valid", () => {
    test("should render the page with correct scripts, header, and logo", async () => {
      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
            customData: "{}",
          } as SearchParams),
        }),
      );

      const scripts = container.getElementsByTagName("script");
      expect(scripts).toHaveLength(2);
      expect(scripts[0]).toHaveAttribute("src", "/js/widget.js");
      expect(scripts[0]).toHaveAttribute("defer");

      const widgetScript = container.getElementsByTagName("script")[1];
      const scriptContent = widgetScript.innerHTML;

      expect(scriptContent).toContain('"envPrefix":"test-prefix"');
      expect(scriptContent).toContain('"organizationId":"test-org"');
      expect(scriptContent).toContain('"agentId":"test-agent"');
      expect(scriptContent).toContain('"bgColor":"#123456"');
      expect(scriptContent).toContain('"signedUserData":"mock-signed-data"');
      expect(scriptContent).toContain('"customData":{}');
    });
  });

  describe("custom data handling", () => {
    test("should parse and include valid custom data", async () => {
      const customData = {
        testKey: "testValue",
        numberKey: 123,
      };

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
            customData: JSON.stringify(customData),
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(
        `"customData":${JSON.stringify({
          testKey: "testValue",
          numberKey: 123,
        })}`,
      );
    });

    test("should handle invalid custom data JSON gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
            customData: "invalid-json",
          } as SearchParams),
        }),
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error parsing customData",
        expect.any(Error),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"customData":{}`);
    });

    test("should use default custom data when customData param is not provided", async () => {
      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"customData":{}`);
    });
  });

  describe("when parameters are missing", () => {
    const mockSearchParams: SearchParams = { authenticated: "true" };

    test("should call notFound when organizationId is missing", async () => {
      await PreviewPage({
        params: Promise.resolve({
          ...mockParams,
          organizationId: "",
        }),
        searchParams: Promise.resolve(mockSearchParams),
      });
      expect(notFound).toHaveBeenCalled();
    });

    test("should call notFound when agentId is missing", async () => {
      await PreviewPage({
        params: Promise.resolve({
          ...mockParams,
          agentId: "",
        }),
        searchParams: Promise.resolve(mockSearchParams),
      });
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("when brand color is not set", () => {
    test("should use default background color", async () => {
      vi.mocked(getPublicAppSettings).mockResolvedValue({
        branding: {},
        security: {},
        misc: {},
      } as any);

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"bgColor":"#00202b"`);
    });
  });

  describe("signed user data handling", () => {
    test("should include signed user data when authenticated is present", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
            customData: "{}",
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(
        `"signedUserData":"mock-signed-data"`,
      );
    });

    test("should not include signed user data when authenticated is not present", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            customContext: "true",
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).not.toContain(`"signedUserData"`);
    });

    test("should not include signed user data when no params are present", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({} as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).not.toContain(`"signedUserData"`);
    });
  });

  describe("error handling", () => {
    test("should handle signed user data generation error gracefully", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockError = new Error("Failed to generate signed data");
      vi.mocked(generateSignedUserData).mockRejectedValue(mockError);

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
          } as SearchParams),
        }),
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error generating signed user data",
        mockError,
      );
      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).not.toContain(`"signedUserData"`);
    });
  });

  describe("environment prefix handling", () => {
    test("should handle missing env prefix", async () => {
      mockHeaders.delete("x-magi-env-prefix");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"envPrefix":""`);
    });

    test("should use provided env prefix", async () => {
      mockHeaders.set("x-magi-env-prefix", "custom-prefix");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            authenticated: "true",
            customContext: "true",
          } as SearchParams),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"envPrefix":"custom-prefix"`);
    });
  });
});
