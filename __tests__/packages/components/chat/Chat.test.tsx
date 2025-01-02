import React from "react";
import { render, screen, act } from "@testing-library/react";
import { describe, expect, test, vi, beforeEach } from "vitest";
import Chat, { ChatContext } from "@magi/components/chat/Chat";
import { useSettings } from "@/app/providers/SettingsProvider";
import { ConversationMessageResponse } from "mavenagi/api";
import { UserChatMessage } from "@/types";

// Mock the settings provider
vi.mock("@/app/providers/SettingsProvider", () => ({
  useSettings: vi.fn(),
}));

const mockUseSettings = vi.mocked(useSettings);

describe("Chat", () => {
  const defaultProps = {
    messages: [],
    askFn: vi.fn(),
    initializeHandoff: vi.fn(),
    agentName: null,
    isHandoff: false,
    handleEndHandoff: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseSettings.mockReturnValue({
      brandColor: "#000000",
      brandFontColor: "#FFFFFF",
    });
  });

  test("renders children correctly", () => {
    render(
      <Chat {...defaultProps}>
        <div data-testid="test-child">Test Child</div>
      </Chat>,
    );

    expect(screen.getByTestId("test-child")).toBeInTheDocument();
  });

  test("applies custom className", () => {
    const { container } = render(
      <Chat {...defaultProps} className="custom-class">
        <div>Content</div>
      </Chat>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });

  test("applies brand colors from settings", () => {
    const { container } = render(
      <Chat {...defaultProps}>
        <div>Content</div>
      </Chat>,
    );

    const style = window.getComputedStyle(container.firstChild as Element);
    expect(style.getPropertyValue("--brand-color")).toBe("#000000");
    expect(style.getPropertyValue("--brand-font-color")).toBe("#FFFFFF");
  });

  test("updates followUpQuestions when receiving bot message", () => {
    const messages = [
      {
        type: "bot",
        metadata: {
          followupQuestions: ["Question 1", "Question 2"],
        },
      } as ConversationMessageResponse,
    ];

    // Create TestConsumer component
    const TestConsumer = () => {
      const context = React.useContext(ChatContext);
      return (
        <div data-testid="follow-up-questions">
          {context.followUpQuestions.join(",")}
        </div>
      );
    };

    // Single render with TestConsumer
    const { rerender } = render(
      <Chat {...defaultProps} messages={messages}>
        <TestConsumer />
      </Chat>,
    );

    expect(screen.getByTestId("follow-up-questions")).toHaveTextContent(
      "Question 1,Question 2",
    );

    // Test clearing follow-up questions with non-bot message
    const newMessages = [{ type: "USER", text: "Hello" } as UserChatMessage];
    rerender(
      <Chat {...defaultProps} messages={newMessages}>
        <TestConsumer />
      </Chat>,
    );

    expect(screen.getByTestId("follow-up-questions")).toHaveTextContent("");
  });

  test("provides correct context values", () => {
    const askFn = vi.fn();
    const initializeHandoff = vi.fn();
    const handleEndHandoff = vi.fn();

    const TestConsumer = () => {
      const context = React.useContext(ChatContext);
      return (
        <div>
          <button onClick={() => context.ask("test")}>Ask</button>
          <button
            onClick={() =>
              context.initializeHandoff({ email: "test@test.com" })
            }
          >
            Init Handoff
          </button>
          <button onClick={context.handleEndHandoff}>End Handoff</button>
          <div data-testid="agent-name">{context.agentName}</div>
          <div data-testid="is-handoff">{context.isHandoff.toString()}</div>
        </div>
      );
    };

    render(
      <Chat
        {...defaultProps}
        askFn={askFn}
        initializeHandoff={initializeHandoff}
        handleEndHandoff={handleEndHandoff}
        agentName="Test Agent"
        isHandoff={true}
      >
        <TestConsumer />
      </Chat>,
    );

    const buttons = screen.getAllByRole("button");
    act(() => {
      buttons[0].click(); // Ask button
      buttons[1].click(); // Init Handoff button
      buttons[2].click(); // End Handoff button
    });

    expect(askFn).toHaveBeenCalledWith("test");
    expect(initializeHandoff).toHaveBeenCalledWith({ email: "test@test.com" });
    expect(handleEndHandoff).toHaveBeenCalled();
    expect(screen.getByTestId("agent-name")).toHaveTextContent("Test Agent");
    expect(screen.getByTestId("is-handoff")).toHaveTextContent("true");
  });
});
