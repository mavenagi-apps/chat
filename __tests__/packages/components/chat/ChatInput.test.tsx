import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { ChatInput } from "@magi/components/chat/ChatInput";
import { ChatContext } from "@magi/components/chat/Chat";
import userEvent from "@testing-library/user-event";

// Mock next-intl
vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));

describe("ChatInput", () => {
  const mockAsk = vi.fn();
  const defaultProps = {
    isSubmitting: false,
    questionPlaceholder: "placeholder.text",
  };

  const mockContextValue = {
    followUpQuestions: [],
    ask: mockAsk,
    isHandoff: false,
    agentName: "",
    handleEndHandoff: vi.fn(),
    initializeHandoff: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders input field and submit button", () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    expect(screen.getByTestId("chat-input")).toBeInTheDocument();
    expect(screen.getByTestId("submit-question")).toBeInTheDocument();
  });

  it("submits question with attachment ", async () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    const input = screen.getByTestId("chat-input");
    const fileInput = screen.getByTestId("chat-file-input");
    const submitButton = screen.getByTestId("submit-question");

    const file = new File(["hello"], "hello.png", { type: "image/png" });

    // simulate upload event and wait until finish
    await waitFor(() => userEvent.upload(fileInput, file));

    await waitFor(() => {
      expect(screen.getByText("hello.png")).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: "test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAsk).toHaveBeenCalledWith("test question", [
        {
          type: "image/png",
          content: "aGVsbG8=",
        },
      ]);
    });
    expect(fileInput.files[0]).toStrictEqual(file);
  });

  it("submits question when form is submitted", async () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    const input = screen.getByTestId("chat-input");
    const submitButton = screen.getByTestId("submit-question");

    fireEvent.change(input, { target: { value: "test question" } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockAsk).toHaveBeenCalledWith("test question", []);
    });
  });

  it("disables submit button when input is empty", () => {
    render(
      <ChatContext.Provider value={mockContextValue}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    const submitButton = screen.getByTestId("submit-question");
    expect(submitButton).toBeDisabled();
  });

  it("shows follow-up questions when available", () => {
    const contextWithFollowUps = {
      ...mockContextValue,
      followUpQuestions: ["Follow up 1", "Follow up 2", "Follow up 3"],
    };

    render(
      <ChatContext.Provider value={contextWithFollowUps}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    expect(screen.getByText("Follow up 1")).toBeInTheDocument();
    expect(screen.getByText("see_more")).toBeInTheDocument();
  });

  it("shows handoff bar when isHandoff is true", () => {
    const contextWithHandoff = {
      ...mockContextValue,
      isHandoff: true,
      agentName: "John Doe",
    };

    render(
      <ChatContext.Provider value={contextWithHandoff}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    expect(screen.getByText(/speaking_with_agent/)).toBeInTheDocument();
    expect(screen.getByText("end_chat")).toBeInTheDocument();
  });

  it("expands and collapses follow-up questions", async () => {
    const contextWithFollowUps = {
      ...mockContextValue,
      followUpQuestions: ["Follow up 1", "Follow up 2", "Follow up 3"],
    };

    render(
      <ChatContext.Provider value={contextWithFollowUps}>
        <ChatInput {...defaultProps} />
      </ChatContext.Provider>,
    );

    // Initially only shows first question
    expect(screen.getByText("Follow up 1")).toBeInTheDocument();
    expect(screen.queryByText("Follow up 2")).not.toBeInTheDocument();

    // Click "see more"
    fireEvent.click(screen.getByText("see_more"));

    // Should show all questions
    await waitFor(() => {
      expect(screen.getByText("Follow up 2")).toBeInTheDocument();
      expect(screen.getByText("Follow up 3")).toBeInTheDocument();
    });

    // Click "see less"
    fireEvent.click(screen.getByText("see_less"));

    // Should hide additional questions
    await waitFor(() => {
      expect(screen.queryByText("Follow up 2")).not.toBeInTheDocument();
      expect(screen.queryByText("Follow up 3")).not.toBeInTheDocument();
    });
  });
});
