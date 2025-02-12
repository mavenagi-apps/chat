import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { ChatMessage, CombinedMessage } from "@/types";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/navigation";
import { useSettings } from "@/app/providers/SettingsProvider";

/**
 * DOM events that trigger timer reset, indicating user activity.
 */
const IDLE_EVENTS = [
  "mousemove",
  "mousedown",
  "keypress",
  "DOMMouseScroll",
  "mousewheel",
  "touchmove",
  "MSPointerMove",
] as const;

interface UseIdleMessageProps {
  messages: CombinedMessage[];
  conversationId: string;
  agentName: string;
  addMessage: (message: ChatMessage) => void;
}

/**
 * Hook for managing idle message display based on user inactivity.
 * Implements timer-based message injection with configurable timeout.
 * Ensures single message display per session with cleanup on unmount.
 *
 * @param messages - Message history for user activity detection
 * @param conversationId - Unique conversation identifier
 * @param agentName - Agent identifier for connection state
 * @param addMessage - Message injection callback
 */
export function useIdleMessage({
  messages,
  conversationId,
  agentName,
  addMessage,
}: UseIdleMessageProps) {
  const { misc } = useSettings();
  const t = useTranslations("chat.IdleMessage");
  const hasConnectedToAgent = useRef(false);
  const timerRef = useRef<NodeJS.Timeout>();
  const hasDisplayedMessage = useRef(false);
  const eventListenersMap = useRef(new Map<string, () => void>());
  const isFirstRender = useRef(true);
  const [showMessage, setShowMessage] = useState(false);
  const analytics = useAnalytics();
  const { agentId } = useParams();
  const surveyLink = misc.handoffConfiguration?.surveyLink;

  /**
   * Detects presence of user-initiated messages in conversation history.
   */
  const userMessagesExist = useMemo(
    () => messages.some((message) => message.type === "USER"),
    [messages],
  );

  /**
   * Determines timer initialization eligibility based on:
   * - Timeout configuration
   * - User message presence
   * - Survey link availability
   * - Message display state
   */
  const shouldInitializeTimer = useMemo(() => {
    return (
      !showMessage &&
      misc.idleMessageTimeout &&
      userMessagesExist &&
      surveyLink &&
      !hasDisplayedMessage.current
    );
  }, [showMessage, misc.idleMessageTimeout, userMessagesExist, surveyLink]);

  /**
   * Controls message display eligibility based on timer state and display history.
   */
  const shouldDisplayMessage = useMemo(() => {
    return showMessage && surveyLink && !hasDisplayedMessage.current;
  }, [showMessage, surveyLink]);

  /**
   * Manages timer lifecycle:
   * 1. Clears existing timer if present
   * 2. Initializes new timer if conditions met
   * 3. Sets display state on timer completion
   */
  const resetTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    if (!shouldInitializeTimer) {
      return;
    }

    const timeoutMs = misc.idleMessageTimeout
      ? misc.idleMessageTimeout * 1000
      : undefined;

    if (!timeoutMs) {
      return;
    }

    timerRef.current = setTimeout(() => {
      setShowMessage(true);
    }, timeoutMs);
  }, [misc.idleMessageTimeout, shouldInitializeTimer]);

  /**
   * Performs cleanup operations:
   * - Clears active timer
   * - Removes registered event listeners
   */
  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }

    // Remove all event listeners using the saved references
    eventListenersMap.current.forEach((listener, event) => {
      window.removeEventListener(event, listener);
    });
    eventListenersMap.current.clear();
  }, []);

  /**
   * Resets timer on message array changes.
   * Skips initial setup to prevent duplicate initialization.
   */
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    resetTimer();
  }, [messages, resetTimer]);

  /**
   * Records analytics event with metadata for idle message display.
   */
  const callAnalytics = useCallback(() => {
    analytics.logEvent(MagiEvent.idleMessageDisplay, {
      agentId,
      conversationId: conversationId || "",
      agentConnected: hasConnectedToAgent.current,
    });
  }, [analytics, agentId, conversationId]);

  /**
   * Tracks agent connection state for analytics and message content.
   */
  useEffect(() => {
    if (agentName && !hasConnectedToAgent.current) {
      hasConnectedToAgent.current = true;
    }
  }, [agentName]);

  /**
   * Constructs idle message with dynamic survey link and metadata.
   */
  const idleMessage = useMemo(
    () => ({
      text: t("idle_message_with_survey", {
        url: surveyLink,
        urlParams: `?chatKey=${conversationId}&agentConnected=${hasConnectedToAgent.current ? "Yes" : "No"}`,
      }),
      type: "SIMULATED" as const,
    }),
    [t, surveyLink, conversationId, hasConnectedToAgent],
  );

  /**
   * Executes message display sequence:
   * 1. Validates display conditions
   * 2. Injects message
   * 3. Records analytics
   * 4. Performs cleanup
   * 5. Updates display state
   */
  const displayMessage = useCallback(() => {
    if (!shouldDisplayMessage) return;
    addMessage(idleMessage);
    callAnalytics();
    cleanup();
    hasDisplayedMessage.current = true;
  }, [idleMessage, addMessage, callAnalytics, cleanup, shouldDisplayMessage]);

  /**
   * Triggers message display sequence on timer completion.
   */
  useEffect(() => {
    if (!shouldDisplayMessage) return;
    displayMessage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldDisplayMessage]);

  /**
   * Initializes and maintains activity monitoring:
   * 1. Sets up event listeners for user activity
   * 2. Initializes idle timer
   * 3. Handles cleanup on unmount or condition changes
   */
  useEffect(() => {
    if (!shouldInitializeTimer) {
      cleanup();
      return;
    }

    // Create new event listeners and save them in the map
    IDLE_EVENTS.forEach((event) => {
      const listener = () => resetTimer();
      eventListenersMap.current.set(event, listener);
      window.addEventListener(event, listener);
    });

    resetTimer();

    return cleanup;
  }, [resetTimer, cleanup, shouldInitializeTimer]);
}
