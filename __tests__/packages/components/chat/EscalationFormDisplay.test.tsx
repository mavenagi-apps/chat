import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import EscalationFormDisplay from "@/src/packages/components/chat/EscalationFormDisplay";
import { ChatContext } from "@/src/packages/components/chat/Chat";
import { useAuth } from "@/src/app/providers/AuthProvider";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import { useParams } from "next/navigation";
import { isHandoffAvailable } from "@/src/app/actions";
import type { CustomField } from "@/src/lib/handoff/types";

// Mock the next-intl translations
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

// Mock the auth hook
vi.mock("@/src/app/providers/AuthProvider", () => ({
  useAuth: vi.fn().mockReturnValue({
    isAuthenticated: false,
  }),
}));

vi.mock("@/src/app/providers/SettingsProvider", () => ({
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

vi.mock("@/src/app/actions", () => ({
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

// Sample custom fields for testing
const sampleCustomFields: CustomField[] = [
  {
    id: 1,
    label: "First Name",
    description: "Your first name",
    required: true,
    type: "STRING",
  },
  {
    id: 2,
    label: "Subscribe to newsletter",
    description: "Receive updates about our products",
    required: false,
    type: "BOOLEAN",
  },
  {
    id: 3,
    label: "Priority",
    description: "Select your issue priority",
    required: true,
    enumOptions: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
  },
];

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
      customFields?: CustomField[];
    } = {},
  ) => {
    const {
      isAuthenticated = false,
      enableAvailabilityCheck = false,
      availabilityFallbackMessage = "agents_unavailable",
      isAvailable = true,
      customFields = [],
    } = config;

    (useAuth as any).mockReturnValue({ isAuthenticated });
    (useSettings as any).mockReturnValue({
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          enableAvailabilityCheck,
          availabilityFallbackMessage,
          customFields,
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
        customFieldValues: {},
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
        customFieldValues: {},
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
        customFieldValues: {},
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

  // New tests for custom fields
  it("renders text custom fields", async () => {
    renderComponent({
      customFields: [sampleCustomFields[0]],
    });

    await waitFor(() => {
      expect(screen.getByText("First Name")).toBeInTheDocument();
      expect(screen.getByText("Your first name")).toBeInTheDocument();
      const inputs = screen.getAllByRole("textbox");
      for (const input of inputs) {
        expect(input).toBeInTheDocument();
        expect(input).toBeRequired();
      }
    });
  });

  it("renders dropdown custom fields", async () => {
    renderComponent({
      customFields: [sampleCustomFields[2]],
    });

    await waitFor(() => {
      expect(screen.getByText("Priority")).toBeInTheDocument();
      expect(
        screen.getByText("Select your issue priority"),
      ).toBeInTheDocument();
      // Note: The actual dropdown might be rendered differently depending on the UI library
      // This is a basic check for the label
      expect(screen.getByText("Priority")).toBeInTheDocument();
    });
  });
});
