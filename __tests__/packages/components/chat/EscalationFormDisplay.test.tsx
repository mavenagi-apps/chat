import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import EscalationFormDisplay from "@/packages/components/chat/EscalationFormDisplay";
import { ChatContext } from "@/packages/components/chat/Chat";
import { useAuth } from "@/app/providers/AuthProvider";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useParams } from "next/navigation";
import { isHandoffAvailable } from "@/app/actions";

// Mock the next-intl translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth hook
vi.mock("@/app/providers/AuthProvider", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: false,
  }),
}));

vi.mock("@/app/providers/SettingsProvider", () => ({
  useSettings: vi.fn().mockReturnValue({
    branding: {},
    security: {},
    misc: {
      handoffConfiguration: {
        enableAvailabilityCheck: false,
        availabilityFallbackMessage: "agents_unavailable",
      },
    },
  }),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/app/actions", () => ({
  isHandoffAvailable: vi.fn(),
}));

const mockInitializeHandoff = vi.fn();

const mockProviderValue = {
  initializeHandoff: mockInitializeHandoff,
  followUpQuestions: [],
  ask: vi.fn(),
  agentName: "Test Agent",
  isHandoff: false,
  handleEndHandoff: vi.fn(),
  addMessage: vi.fn(),
  conversationId: "test-conv-id",
  messages: [],
  shouldSupressHandoffInputDisplay: false,
  disableAttachments: false,
};

describe("EscalationFormDisplay", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useParams as any).mockReturnValue({
      organizationId: "org-id",
      agentId: "agent-id",
    });
    (useSettings as any).mockReturnValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          enableAvailabilityCheck: false,
          availabilityFallbackMessage: "agents_unavailable",
        },
      },
    });
  });

  const renderComponent = (
    config: {
      isAuthenticated?: boolean;
      enableAvailabilityCheck?: boolean;
      availabilityFallbackMessage?: string;
      isAvailable?: boolean;
    } = {},
  ) => {
    const {
      isAuthenticated = false,
      enableAvailabilityCheck = false,
      availabilityFallbackMessage = "agents_unavailable",
      isAvailable = true,
    } = config;

    (useAuth as any).mockReturnValue({ isAuthenticated });
    (useSettings as any).mockReturnValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          enableAvailabilityCheck,
          availabilityFallbackMessage,
        },
      },
    });
    (isHandoffAvailable as any).mockResolvedValue(isAvailable);

    return render(
      <ChatContext.Provider value={mockProviderValue}>
        <EscalationFormDisplay />
      </ChatContext.Provider>,
    );
  };

  it("shows loading state initially when availability check enabled", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (isHandoffAvailable as any).mockReturnValue(promise);

    renderComponent({ enableAvailabilityCheck: true });

    // Initial loading state
    expect(screen.getByRole("progressbar")).toBeInTheDocument();
    expect(screen.queryByText("connect_to_live_agent")).not.toBeInTheDocument();

    // Resolve the availability check
    await act(async () => {
      resolvePromise!(true);
    });

    // Form should now be visible
    await waitFor(() => {
      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
      expect(screen.getByText("connect_to_live_agent")).toBeInTheDocument();
    });
  });

  it("shows fallback message when agents are not available", async () => {
    renderComponent({
      enableAvailabilityCheck: true,
      isAvailable: false,
      availabilityFallbackMessage: "Custom fallback message",
    });

    await waitFor(() => {
      expect(screen.getByText("Custom fallback message")).toBeInTheDocument();
    });
  });

  it("shows form when availability check is disabled", async () => {
    renderComponent({ enableAvailabilityCheck: false });

    await waitFor(() => {
      expect(screen.getByText("connect_to_live_agent")).toBeInTheDocument();
    });
  });

  it("shows form when agents are available", async () => {
    renderComponent({
      enableAvailabilityCheck: true,
      isAvailable: true,
    });

    await waitFor(() => {
      expect(screen.getByText("connect_to_live_agent")).toBeInTheDocument();
    });
  });

  it("submits the form when the button is clicked", async () => {
    renderComponent();

    await waitFor(() => {
      const emailInput = screen.getByPlaceholderText("email_placeholder");
      fireEvent.change(emailInput, { target: { value: "test@example.com" } });

      const submitButton = screen.getByText("connect_to_live_agent");
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockInitializeHandoff).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });
  });

  it("renders email input when user is not authenticated", async () => {
    renderComponent({ isAuthenticated: false });

    await waitFor(() => {
      expect(
        screen.getByPlaceholderText("email_placeholder"),
      ).toBeInTheDocument();
    });
  });

  it("does not render email input when user is authenticated", async () => {
    renderComponent({ isAuthenticated: true });

    await waitFor(() => {
      expect(
        screen.queryByPlaceholderText("email_placeholder"),
      ).not.toBeInTheDocument();
    });
  });

  it("submits form with email for unauthenticated user", async () => {
    renderComponent({ isAuthenticated: false });

    await waitFor(async () => {
      const emailInput = screen.getByPlaceholderText("email_placeholder");
      const submitButton = screen.getByText("connect_to_live_agent");

      fireEvent.change(emailInput, { target: { value: "test@example.com" } });
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockInitializeHandoff).toHaveBeenCalledWith({
        email: "test@example.com",
      });
    });
  });

  it("submits form without email for authenticated user", async () => {
    renderComponent({ isAuthenticated: true });

    await waitFor(async () => {
      const submitButton = screen.getByText("connect_to_live_agent");
      fireEvent.click(submitButton);
    });

    await waitFor(() => {
      expect(mockInitializeHandoff).toHaveBeenCalledWith({
        email: undefined,
      });
    });
  });

  it("displays error message when submission fails", async () => {
    vi.spyOn(console, "error").mockImplementationOnce(() => {});
    mockInitializeHandoff.mockRejectedValueOnce(new Error("Test error"));
    renderComponent();

    await waitFor(async () => {
      const form = screen.getByRole("form");
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(
        screen.getByText("Failed to initiate chat session. Please try again."),
      ).toBeInTheDocument();
    });
  });

  it("hides form after successful submission", async () => {
    renderComponent();

    await waitFor(async () => {
      const form = screen.getByRole("form");
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(
        screen.queryByText("connect_to_live_agent"),
      ).not.toBeInTheDocument();
    });
  });

  it("does not show loading state when availability check is disabled", async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    (isHandoffAvailable as any).mockReturnValue(promise);

    renderComponent({ enableAvailabilityCheck: false });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText("connect_to_live_agent")).toBeInTheDocument();

    // Resolving the promise should not affect the UI
    await act(async () => {
      resolvePromise!(true);
    });

    expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    expect(screen.getByText("connect_to_live_agent")).toBeInTheDocument();
  });
});
