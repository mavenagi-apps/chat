import { render, screen, fireEvent } from "@testing-library/react";
import { ChatHeader } from "@/src/packages/components/chat/ChatHeader";
import { describe, it, expect } from "vitest";

describe("ChatHeader", () => {
  const defaultLogo = "/assets/logo/mavenagi_logo_wide_on_light_purple.svg";
  const customLogoUrl = "https://example.com/custom-logo.png";
  const fallbackLogoUrl = "https://example.com/fallback-logo.png";

  it("renders with default logo when no logo is provided", () => {
    render(<ChatHeader />);

    const logoImage = screen.getByRole("img", { name: /logo/i });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute(
      "src",
      expect.stringContaining(defaultLogo),
    );
  });

  it("renders with custom logo when logo is provided", () => {
    render(<ChatHeader logo={customLogoUrl} />);

    const logoImage = screen.getByRole("img", { name: /logo/i });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute(
      "src",
      expect.stringContaining(customLogoUrl),
    );
  });

  it("renders with fallback logo when provided and primary logo fails", () => {
    render(<ChatHeader logo={customLogoUrl} fallbackLogo={fallbackLogoUrl} />);

    const logoImage = screen.getByRole("img", { name: /logo/i });
    expect(logoImage).toBeInTheDocument();

    // Simulate an error on the primary logo
    fireEvent.error(logoImage);

    // After error, it should use the fallback logo
    expect(logoImage).toHaveAttribute(
      "src",
      expect.stringContaining(fallbackLogoUrl),
    );
  });

  it("falls back to default logo when both logo and fallbackLogo fail", () => {
    render(<ChatHeader logo={customLogoUrl} fallbackLogo={fallbackLogoUrl} />);

    const logoImage = screen.getByRole("img", { name: /logo/i });

    // Simulate an error on the primary logo
    fireEvent.error(logoImage);

    // Simulate an error on the fallback logo
    fireEvent.error(logoImage);

    // After both errors, it should use the default logo
    expect(logoImage).toHaveAttribute(
      "src",
      expect.stringContaining(defaultLogo),
    );
  });

  it("prioritizes logo over fallbackLogo when both are provided", () => {
    render(<ChatHeader logo={customLogoUrl} fallbackLogo={fallbackLogoUrl} />);

    const logoImage = screen.getByRole("img", { name: /logo/i });
    expect(logoImage).toHaveAttribute(
      "src",
      expect.stringContaining(customLogoUrl),
    );
  });

  it("renders with correct banner role", () => {
    render(<ChatHeader />);

    const banner = screen.getByRole("banner");
    expect(banner).toBeInTheDocument();
  });
});
