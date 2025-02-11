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
    test("should render the page with correct background and scripts", async () => {
      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            anonymous: "anything",
            customData: "{}",
          }),
        }),
      );

      // Check if background image is set correctly
      const mainDiv = container.firstChild as HTMLElement;
      expect(mainDiv).toHaveStyle({
        backgroundImage: `url(/mock-bg-image.jpg)`,
        backgroundSize: "cover",
        height: "100vh",
      });

      // Check if scripts are included
      const scripts = container.getElementsByTagName("script");
      expect(scripts).toHaveLength(2);
      expect(scripts[0]).toHaveAttribute("src", "/js/widget.js");
      expect(scripts[0]).toHaveAttribute("defer");

      // Check if widget load script contains correct payload
      const payloadRegex = `addEventListener\\("load", function \\(\\) {
        Maven\\.ChatWidget\\.load\\({
          "envPrefix":"[^"]+",
          "organizationId":"[^"]+",
          "agentId":"[^"]+",
          "bgColor":"#[0-9a-fA-F]{6}",
          "unsignedUserData":{
            "firstName":"[^"]+",
            "lastName":"[^"]+",
            "id":"[^"]+",
            "email":"[^"]+",
            "todaysDate":"[^"]+"
          },
          "customData":{
          }
        }\\);
      }\\);`.replace(/\s+/g, "");

      expect(scripts[1].innerHTML.replace(/\s+/g, "")).toMatch(
        new RegExp(payloadRegex),
      );
    });
  });

  describe("custom data handling", () => {
    test("should parse and include valid custom data from search params", async () => {
      const customData = {
        testKey: "testValue",
        numberKey: 123,
      };

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            anonymous: "anything",
            customData: JSON.stringify(customData),
          }),
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
            anonymous: "anything",
            customData: "invalid-json",
          }),
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
          searchParams: Promise.resolve({ anonymous: "anything" }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"customData":{}`);
    });
  });

  describe("when parameters are missing", () => {
    const mockSearchParams: {
      anonymous?: string;
      customData?: string;
    } = { anonymous: "anything" };

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
          searchParams: Promise.resolve({ anonymous: "anything" }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"bgColor":"#00202b"`);
    });
  });

  describe("signed user data handling", () => {
    test("should not include signed user data when anonymous param is present", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({
            anonymous: "anything",
            customData: "{}",
          }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).not.toContain(`"signedUserData"`);
    });

    test("should not include signed user data when anonymous param is empty string", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({ anonymous: "" }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).not.toContain(`"signedUserData"`);
    });

    test("should include signed user data when anonymous param is missing", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({}),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(
        `"signedUserData":"mock-signed-data"`,
      );
    });
  });

  describe("when signed user data generation fails", () => {
    test("should handle the error gracefully and not include signed user data", async () => {
      const consoleErrorSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      const mockError = new Error("Failed to generate signed data");
      vi.mocked(generateSignedUserData).mockRejectedValue(mockError);

      const { container } = render(
        await PreviewPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({}),
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
          searchParams: Promise.resolve({ anonymous: "anything" }),
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
          searchParams: Promise.resolve({ anonymous: "anything" }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"envPrefix":"custom-prefix"`);
    });
  });
});
