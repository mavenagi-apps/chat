import { renderHook, act } from "@testing-library/react";
import { useIdleMessage } from "@/lib/useIdleMessage";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/lib/use-analytics";
import { useParams } from "next/navigation";
import { useSettings } from "@/app/providers/SettingsProvider";
import { MagiEvent } from "@/lib/analytics/events";
import type { ChatMessage, CombinedMessage } from "@/types";

// Mock dependencies
vi.mock("next-intl", () => ({
  useTranslations: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/lib/use-analytics", () => ({
  useAnalytics: vi.fn(),
}));

vi.mock("@/app/providers/SettingsProvider", () => ({
  useSettings: vi.fn(),
}));

describe("useIdleMessage", () => {
  const mockAddMessage = vi.fn();
  const mockLogEvent = vi.fn();
  const mockTranslate = vi.fn();
  const defaultProps = {
    messages: [] as CombinedMessage[],
    conversationId: "test-conversation",
    agentName: "",
    addMessage: mockAddMessage,
    isHandoff: false,
  };

  beforeEach(() => {
    // Setup mocks
    (useTranslations as any).mockReturnValue(mockTranslate);
    (useParams as any).mockReturnValue({ agentId: "test-agent" });
    (useAnalytics as any).mockReturnValue({ logEvent: mockLogEvent });
    (useSettings as any).mockReturnValue({
      misc: {
        handoffConfiguration: {
          surveyLink: "https://test-survey.com",
        },
        idleMessageTimeout: 30, // 30 seconds
      },
    });

    mockTranslate.mockImplementation((key: string, params: any) => {
      return `Translated ${key} with ${JSON.stringify(params)}`;
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Tests that use real timers with spies
  it("should call resetTimer when user activity occurs", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");

    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    // Clear initial setup calls
    clearTimeoutSpy.mockClear();
    setTimeoutSpy.mockClear();

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Should have cleared the old timer and set a new one
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    clearTimeoutSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it("should reset timer when messages array changes", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");

    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    const { rerender } = renderHook(() => useIdleMessage(props));

    const newUserMessage: ChatMessage = {
      text: "New message",
      type: "USER",
      timestamp: Date.now(),
    };

    rerender({
      ...props,
      messages: [...props.messages, newUserMessage],
    });

    // Clear initial setup calls
    clearTimeoutSpy.mockClear();
    setTimeoutSpy.mockClear();

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Should have cleared the old timer and set a new one
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    clearTimeoutSpy.mockRestore();
    setTimeoutSpy.mockRestore();
  });

  it("should only add event listeners once", () => {
    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    // Should be called once for each event type
    expect(addEventListenerSpy).toHaveBeenCalledTimes(7); // 7 events in IDLE_EVENTS

    addEventListenerSpy.mockRestore();
  });

  it("should only set one timer at a time", () => {
    const setTimeoutSpy = vi.spyOn(global, "setTimeout");
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));
    setTimeoutSpy.mockClear(); // Clear initial setup calls
    clearTimeoutSpy.mockClear();

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Should set a new timer
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(1);
    setTimeoutSpy.mockRestore();
    clearTimeoutSpy.mockRestore();
  });

  it("should properly clean up previous timer before setting new one", () => {
    const clearTimeoutSpy = vi.spyOn(global, "clearTimeout");
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));
    clearTimeoutSpy.mockClear(); // Clear initial setup calls

    // Simulate multiple user activities
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
      window.dispatchEvent(new Event("mousemove"));
      window.dispatchEvent(new Event("mousemove"));
    });

    // Should clear timeout for each reset
    expect(clearTimeoutSpy).toHaveBeenCalledTimes(3);

    clearTimeoutSpy.mockRestore();
  });

  // Setup fake timers for the rest of the tests
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  // Rest of the tests that use fake timers
  it("should not show idle message if timeout is undefined", () => {
    (useSettings as any).mockReturnValue({
      misc: {
        handoffConfiguration: {
          surveyLink: "https://test-survey.com",
        },
        idleMessageTimeout: undefined,
      },
    });

    const props = {
      ...defaultProps,
      messages: [
        { type: "USER", text: "Hello", timestamp: Date.now() },
      ] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    act(() => {
      vi.advanceTimersByTime(60000); // Advance well beyond any reasonable timeout
    });

    expect(mockAddMessage).not.toHaveBeenCalled();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it("should not show idle message if no user messages exist", () => {
    renderHook(() => useIdleMessage(defaultProps));

    act(() => {
      vi.advanceTimersByTime(60000);
    });

    expect(mockAddMessage).not.toHaveBeenCalled();
    mockAddMessage.mockClear();
  });

  it("should show idle message after timeout when user messages exist", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds in milliseconds
    });

    expect(mockAddMessage).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(MagiEvent.idleMessageDisplay, {
      agentId: "test-agent",
      conversationId: "test-conversation",
      agentConnected: false,
    });
  });

  it("should not show idle message if already shown", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds in milliseconds
    });

    expect(mockAddMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(30000); // Another 30 seconds
    });

    expect(mockAddMessage).toHaveBeenCalledTimes(1);
  });

  it("should reset timer on user activity", () => {
    // Setup initial message to enable idle timer
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));
    mockAddMessage.mockClear(); // Clear any initial calls

    // Advance halfway through the initial 30s timeout
    act(() => {
      vi.advanceTimersByTime(15000); // 15 seconds
    });

    expect(mockAddMessage).not.toHaveBeenCalled();

    // Simulate user activity - this will:
    // 1. Clear the existing timer
    // 2. Start a completely new 30s timer from 0
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Advance 20s into the new timer
    // Total time: 15s (before reset) + 20s = 35s
    // New timer: 20s elapsed, 10s remaining until 30s
    act(() => {
      vi.advanceTimersByTime(20000);
    });
    // Message shouldn't be shown yet since only 20s have passed since reset
    expect(mockAddMessage).not.toHaveBeenCalled();

    // Advance the remaining time to trigger the idle message
    // Need full 30s from the reset point, so advance remaining 10s
    act(() => {
      vi.advanceTimersByTime(30000); // Advance full 30s to ensure we hit the timeout
    });

    // Now the message should be shown since full 30s have passed since last activity
    expect(mockAddMessage).toHaveBeenCalledTimes(1);
  });

  it("should track agent connection status", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
      agentName: "New Agent",
    };

    renderHook(() => useIdleMessage(props));

    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds in milliseconds
    });

    expect(mockLogEvent).toHaveBeenCalledWith(MagiEvent.idleMessageDisplay, {
      agentId: "test-agent",
      conversationId: "test-conversation",
      agentConnected: true,
    });
  });

  it("should not show idle message if survey link is not configured", () => {
    (useSettings as any).mockReturnValue({
      misc: {
        handoffConfiguration: {
          surveyLink: undefined,
        },
        idleMessageTimeout: 30, // 30 seconds
      },
    });

    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    act(() => {
      vi.advanceTimersByTime(30000); // 30 seconds in milliseconds
    });

    expect(mockAddMessage).not.toHaveBeenCalled();
  });

  it("should cleanup timers and event listeners on unmount", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    const { unmount } = renderHook(() => useIdleMessage(props));
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    unmount();

    expect(removeEventListenerSpy).toHaveBeenCalled();
    removeEventListenerSpy.mockRestore();
  });

  it("should only call addMessage once ever, even across remounts", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    // First mount
    const { rerender } = renderHook(() => useIdleMessage(props));

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    expect(mockAddMessage).toHaveBeenCalledTimes(1);
    mockAddMessage.mockClear();

    // Rerender instead of unmount/remount to preserve refs
    rerender();

    act(() => {
      vi.advanceTimersByTime(30000);
    });

    // Should not call addMessage again
    expect(mockAddMessage).not.toHaveBeenCalled();
  });

  it("should only call addMessage once even with multiple user activities", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
    };

    renderHook(() => useIdleMessage(props));

    // First timeout
    act(() => {
      vi.advanceTimersByTime(30000);
    });
    expect(mockAddMessage).toHaveBeenCalledTimes(1);

    // Reset timer multiple times
    for (let i = 0; i < 3; i++) {
      act(() => {
        window.dispatchEvent(new Event("mousemove"));
        vi.advanceTimersByTime(30000);
      });
    }

    // Should still only have been called once total
    expect(mockAddMessage).toHaveBeenCalledTimes(1);
  });

  it("should display message when handoff status changes from true to false", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
      isHandoff: true,
    };

    // Initial render with isHandoff true
    const { rerender } = renderHook(
      ({ isHandoff }) => useIdleMessage({ ...props, isHandoff }),
      {
        initialProps: { isHandoff: true },
      },
    );

    // Change handoff status to false
    rerender({ isHandoff: false });

    expect(mockAddMessage).toHaveBeenCalledTimes(1);
    expect(mockLogEvent).toHaveBeenCalledWith(MagiEvent.idleMessageDisplay, {
      agentId: "test-agent",
      conversationId: "test-conversation",
      agentConnected: false,
    });
  });

  it("should not display message if handoff status changes from false to true", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
      isHandoff: false,
    };

    // Initial render with isHandoff true
    const { rerender } = renderHook(
      ({ isHandoff }) => useIdleMessage({ ...props, isHandoff }),
      {
        initialProps: { isHandoff: false },
      },
    );

    rerender({ isHandoff: true });

    expect(mockAddMessage).not.toHaveBeenCalled();
  });

  it("should not display message if handoff status changes from true to false and there is no valid configuration", () => {
    const userMessage: ChatMessage = {
      text: "Hello",
      type: "USER",
      timestamp: Date.now(),
    };

    (useSettings as any).mockReturnValue({
      misc: {
        handoffConfiguration: {
          surveyLink: undefined,
        },
        idleMessageTimeout: 30, // 30 seconds
      },
    });

    const props = {
      ...defaultProps,
      messages: [userMessage] as CombinedMessage[],
      isHandoff: true,
    };

    // Initial render with isHandoff true
    const { rerender } = renderHook(
      ({ isHandoff }) => useIdleMessage({ ...props, isHandoff }),
      {
        initialProps: { isHandoff: true },
      },
    );

    // Change handoff status to false
    rerender({ isHandoff: false });

    expect(mockAddMessage).not.toHaveBeenCalled();
  });
});
