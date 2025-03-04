import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { WelcomeMessage } from "@magi/components/chat/WelcomeChatMessage";
import { ChatContext } from "@magi/components/chat/Chat";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import { useAnalytics } from "@/src/lib/use-analytics";
import { MagiEvent } from "@/src/lib/analytics/events";

// Mock dependencies
vi.mock("@/src/app/providers/SettingsProvider");
vi.mock("@/src/lib/use-analytics");
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) =>
    key === "default_welcome_message" ? "Welcome to the chat!" : key,
}));

describe("WelcomeMessage", () => {
  const mockAsk = vi.fn();
  const mockLogEvent = vi.fn();

  // Default props
  const defaultProps = {
    agentId: "test-agent-id",
    conversationId: "test-conversation-id",
  };

  // Setup context provider wrapper
  const renderWithContext = (ui: React.ReactElement) => {
    return render(
      <ChatContext.Provider value={{ ask: mockAsk } as any}>
        {ui}
      </ChatContext.Provider>,
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock useSettings
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: null,
      },
    });

    // Mock useAnalytics
    (useAnalytics as any).mockReturnValue({
      logEvent: mockLogEvent,
    });
  });

  it("renders default welcome message when no custom message is provided", () => {
    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("Welcome to the chat!")).toBeInTheDocument();
  });

  it("renders custom welcome message when provided as a string", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: "Custom welcome message",
        popularQuestions: null,
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("Custom welcome message")).toBeInTheDocument();
  });

  it("renders localized welcome message when provided as JSON", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: JSON.stringify({
          en: "English welcome",
          fr: "French welcome",
        }),
        popularQuestions: null,
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("English welcome")).toBeInTheDocument();
  });

  it("renders popular questions when provided as a JSON string", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: JSON.stringify([
          "Question 1",
          "Question 2",
          "Question 3",
        ]),
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("Question 3")).toBeInTheDocument();
  });

  it("renders popular questions when provided as an array", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: ["Question 1", "Question 2", "Question 3"],
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("Question 1")).toBeInTheDocument();
    expect(screen.getByText("Question 2")).toBeInTheDocument();
    expect(screen.getByText("Question 3")).toBeInTheDocument();
  });

  it("renders localized popular questions when provided as JSON objects", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: [
          JSON.stringify({ en: "English Q1", fr: "French Q1" }),
          JSON.stringify({ en: "English Q2", fr: "French Q2" }),
        ],
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("English Q1")).toBeInTheDocument();
    expect(screen.getByText("English Q2")).toBeInTheDocument();
  });

  it("limits displayed popular questions to 3", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: ["Q1", "Q2", "Q3", "Q4", "Q5"],
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Q2")).toBeInTheDocument();
    expect(screen.getByText("Q3")).toBeInTheDocument();
    expect(screen.queryByText("Q4")).not.toBeInTheDocument();
    expect(screen.queryByText("Q5")).not.toBeInTheDocument();
  });

  it("filters out empty questions", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: ["Q1", "", "Q3"],
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("Q1")).toBeInTheDocument();
    expect(screen.getByText("Q3")).toBeInTheDocument();

    // Get all question elements by their class
    const questionElements = document.querySelectorAll(
      ".my-1.cursor-pointer.underline",
    );
    expect(questionElements.length).toBe(2);
  });

  it("handles click on popular question", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: ["Question 1"],
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    fireEvent.click(screen.getByText("Question 1"));

    expect(mockLogEvent).toHaveBeenCalledWith(MagiEvent.popularQuestionClick, {
      agentId: "test-agent-id",
      conversationId: "test-conversation-id",
      question: "Question 1",
    });

    expect(mockAsk).toHaveBeenCalledWith("Question 1");
  });

  it("handles empty conversationId when clicking popular question", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: ["Question 1"],
      },
    });

    renderWithContext(<WelcomeMessage agentId="test-agent-id" />);

    fireEvent.click(screen.getByText("Question 1"));

    expect(mockLogEvent).toHaveBeenCalledWith(MagiEvent.popularQuestionClick, {
      agentId: "test-agent-id",
      conversationId: "",
      question: "Question 1",
    });
  });

  it("handles error when parsing welcome message", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: "{invalid-json",
        popularQuestions: null,
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    expect(screen.getByText("{invalid-json")).toBeInTheDocument();
  });

  it("handles error when parsing popular questions", () => {
    (useSettings as any).mockReturnValue({
      branding: {
        welcomeMessage: null,
        popularQuestions: "{invalid-json",
      },
    });

    renderWithContext(<WelcomeMessage {...defaultProps} />);

    // Should render welcome message but no questions
    expect(screen.getByText("Welcome to the chat!")).toBeInTheDocument();

    // Check that no question elements are rendered
    const questionElements = document.querySelectorAll(
      ".my-1.cursor-pointer.underline",
    );
    expect(questionElements.length).toBe(0);
  });
});
