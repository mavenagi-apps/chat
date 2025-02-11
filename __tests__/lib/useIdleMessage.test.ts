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
  };

  beforeEach(() => {
    vi.useFakeTimers();

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
    vi.clearAllTimers();
    vi.useRealTimers();
  });

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

    // Advance halfway through the timeout
    act(() => {
      vi.advanceTimersByTime(15000); // 15 seconds
    });

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Advance past the original timeout
    act(() => {
      vi.advanceTimersByTime(20000); // 20 seconds
    });

    expect(mockAddMessage).not.toHaveBeenCalled();

    // Advance to the new timeout
    act(() => {
      vi.advanceTimersByTime(15000); // Final 15 seconds
    });

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

    // Initial timer
    expect(setTimeoutSpy).toHaveBeenCalledTimes(1);

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Should clear previous timer and set a new one
    expect(setTimeoutSpy).toHaveBeenCalledTimes(2);

    setTimeoutSpy.mockRestore();
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
});
