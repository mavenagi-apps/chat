import { render, screen, fireEvent } from "@testing-library/react";
import { ChatHeader } from "@/packages/components/chat/ChatHeader";
import { describe, it, expect, vi } from "vitest";

describe("ChatHeader", () => {
  const defaultLogo =
    "https://app.mavenagi.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2Fage_CSMoGtyyQNJ0z8XzyMXK2Jbk%2Flogo%3F1730414949621&w=256&q=75";
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
