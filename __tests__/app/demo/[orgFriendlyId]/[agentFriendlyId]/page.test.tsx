import { render } from "@testing-library/react";
import DemoPage from "@/app/demo/[orgFriendlyId]/[agentFriendlyId]/page";
import { describe, expect, test, vi, beforeEach, afterEach } from "vitest";
import { headers } from "next/headers";
import { getPublicAppSettings } from "@/app/actions";
import { generateSignedUserData } from "@/app/demo/[orgFriendlyId]/[agentFriendlyId]/actions";
import { notFound } from "next/navigation";

// Mock the dependencies
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

vi.mock("@/app/actions", () => ({
  getPublicAppSettings: vi.fn(),
}));

vi.mock("@/app/demo/[orgFriendlyId]/[agentFriendlyId]/actions", () => ({
  generateSignedUserData: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

// Mock the background image import
vi.mock("@/assets/background/bg.jpg", () => ({
  default: { src: "/mock-bg-image.jpg" },
}));

describe("DemoPage", () => {
  const mockParams = {
    orgFriendlyId: "test-org",
    agentFriendlyId: "test-agent",
  };

  const mockHeaders = new Headers();
  mockHeaders.set("x-magi-env-prefix", "test-prefix");

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(headers).mockResolvedValue(mockHeaders);
    vi.mocked(getPublicAppSettings).mockResolvedValue({
      brandColor: "#123456",
    });
    vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("when all parameters are valid", () => {
    test("should render the page with correct background and scripts", async () => {
      const { container } = render(
        await DemoPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({ anonymous: "anything" }),
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
      const expectedPayload = {
        envPrefix: "test-prefix",
        orgFriendlyId: "test-org",
        agentFriendlyId: "test-agent",
        bgColor: "#123456",
      };
      expect(scripts[1].innerHTML).toContain(JSON.stringify(expectedPayload));
    });
  });

  describe("when parameters are missing", () => {
    test("should call notFound when orgFriendlyId is missing", async () => {
      await DemoPage({
        params: Promise.resolve({
          ...mockParams,
          orgFriendlyId: "",
        }),
        searchParams: Promise.resolve({ anonymous: "anything" }),
      });
      expect(notFound).toHaveBeenCalled();
    });

    test("should call notFound when agentFriendlyId is missing", async () => {
      await DemoPage({
        params: Promise.resolve({
          ...mockParams,
          agentFriendlyId: "",
        }),
        searchParams: Promise.resolve({ anonymous: "anything" }),
      });
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe("when brand color is not set", () => {
    test("should use default background color", async () => {
      vi.mocked(getPublicAppSettings).mockResolvedValue({});

      const { container } = render(
        await DemoPage({
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
        await DemoPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({ anonymous: "anything" }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).not.toContain(`"signedUserData"`);
    });

    test("should not include signed user data when anonymous param is empty string", async () => {
      vi.mocked(generateSignedUserData).mockResolvedValue("mock-signed-data");

      const { container } = render(
        await DemoPage({
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
        await DemoPage({
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
        await DemoPage({
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
        await DemoPage({
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
        await DemoPage({
          params: Promise.resolve(mockParams),
          searchParams: Promise.resolve({ anonymous: "anything" }),
        }),
      );

      const widgetScript = container.getElementsByTagName("script")[1];
      expect(widgetScript.innerHTML).toContain(`"envPrefix":"custom-prefix"`);
    });
  });
});
