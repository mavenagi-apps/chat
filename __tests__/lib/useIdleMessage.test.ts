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
    idleTimeout: 1000,
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
        enableIdleMessage: true,
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

  it("should not show idle message if feature is disabled", () => {
    (useSettings as any).mockReturnValue({
      misc: {
        handoffConfiguration: {
          surveyLink: "https://test-survey.com",
        },
        enableIdleMessage: false,
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
      vi.advanceTimersByTime(2000);
    });

    expect(mockAddMessage).not.toHaveBeenCalled();
    expect(mockLogEvent).not.toHaveBeenCalled();
  });

  it("should not show idle message if no user messages exist", () => {
    renderHook(() => useIdleMessage(defaultProps));

    act(() => {
      vi.advanceTimersByTime(2000);
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
      vi.advanceTimersByTime(2000);
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
      vi.advanceTimersByTime(2000);
    });

    expect(mockAddMessage).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(2000);
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
      vi.advanceTimersByTime(500);
    });

    // Simulate user activity
    act(() => {
      window.dispatchEvent(new Event("mousemove"));
    });

    // Advance past the original timeout
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(mockAddMessage).not.toHaveBeenCalled();

    // Advance to the new timeout
    act(() => {
      vi.advanceTimersByTime(500);
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
      vi.advanceTimersByTime(2000);
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
        enableIdleMessage: true,
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
      vi.advanceTimersByTime(2000);
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
});
