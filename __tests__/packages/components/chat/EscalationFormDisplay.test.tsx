import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import EscalationFormDisplay from "@/packages/components/chat/EscalationFormDisplay";
import { ChatContext } from "@/packages/components/chat/Chat";
import { useAuth } from "@/app/providers/AuthProvider";

// Mock the next-intl translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth hook
vi.mock("@/app/providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

const mockInitializeHandoff = vi.fn();

const mockProviderValue = {
  initializeHandoff: mockInitializeHandoff,
  followUpQuestions: [],
  ask: vi.fn(),
  agentName: "Test Agent",
  isHandoff: false,
  handleEndHandoff: vi.fn(),
};

describe("EscalationFormDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderComponent = (isAuthenticated = false) => {
    (useAuth as any).mockReturnValue({ isAuthenticated });

    return render(
      <ChatContext.Provider value={mockProviderValue}>
        <EscalationFormDisplay />
      </ChatContext.Provider>,
    );
  };

  it("submits the form when the button is clicked", async () => {
    renderComponent();

    // Add email input first, required
    const emailInput = screen.getByPlaceholderText("email_placeholder");
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });

    const submitButton = screen.getByText("connect_to_live_agent");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInitializeHandoff).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });
  });

  it("renders email input when user is not authenticated", () => {
    renderComponent(false);
    expect(
      screen.getByPlaceholderText("email_placeholder"),
    ).toBeInTheDocument();
  });

  it("does not render email input when user is authenticated", () => {
    renderComponent(true);
    expect(
      screen.queryByPlaceholderText("email_placeholder"),
    ).not.toBeInTheDocument();
  });

  it("shows connect button with correct text", () => {
    renderComponent();
    expect(screen.getByText("connect_to_live_agent")).toBeInTheDocument();
  });

  it("submits form with email for unauthenticated user", async () => {
    renderComponent(false);

    const emailInput = screen.getByPlaceholderText("email_placeholder");
    const submitButton = screen.getByText("connect_to_live_agent");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInitializeHandoff).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });
  });

  it("submits form without email for authenticated user", async () => {
    renderComponent(true);

    const submitButton = screen.getByText("connect_to_live_agent");
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockInitializeHandoff).toHaveBeenCalledWith({
        email: undefined,
      });
    });
  });

  it("displays error message when submission fails", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    mockInitializeHandoff.mockRejectedValueOnce(new Error("Test error"));
    renderComponent(false);

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to initiate chat session. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("hides form after successful submission", async () => {
    renderComponent(false);

    const form = screen.getByRole("form");
    fireEvent.submit(form);

    await waitFor(() => {
      expect(
        screen.queryByText("connect_to_live_agent"),
      ).not.toBeInTheDocument();
    });
  });
});
