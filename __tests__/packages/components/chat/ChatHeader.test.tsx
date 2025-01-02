import { render, screen } from "@testing-library/react";
import { ChatHeader } from "@/packages/components/chat/ChatHeader";
import { describe, it, expect } from "vitest";

describe("ChatHeader", () => {
  const defaultLogo =
    "https://app.mavenagi.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2Fage_CSMoGtyyQNJ0z8XzyMXK2Jbk%2Flogo%3F1730414949621&w=256&q=75";
  const customLogoUrl = "https://example.com/custom-logo.png";

  it("renders with default logo when no logoUrl is provided", () => {
    render(<ChatHeader />);

    const logoImage = screen.getByRole("img", { name: /logo/i });
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute(
      "src",
      expect.stringContaining(defaultLogo),
    );
  });

  it("renders with custom logo when logoUrl is provided", () => {
    render(<ChatHeader logoUrl={customLogoUrl} />);

    const logoImage = screen.getByRole("img", { name: /logo/i });
    expect(logoImage).toBeInTheDocument();
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
