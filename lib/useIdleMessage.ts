import { useEffect, useRef, useCallback, useMemo, useState } from "react";
import type { ChatMessage, CombinedMessage } from "@/types";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/navigation";
import { useSettings } from "@/app/providers/SettingsProvider";

/**
 * DOM events that reset the idle timer when triggered.
 * These events indicate user activity within the chat interface.
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
 * Hook that manages the display of an idle message after a configurable period of user inactivity.
 * Handles user activity monitoring, timer management, and message display logic.
 *
 * @param messages - Array of chat messages to determine if user has interacted
 * @param conversationId - Unique identifier for the current conversation
 * @param agentName - Name of the agent for connection status tracking
 * @param addMessage - Callback to add the idle message to the chat
 */
export function useIdleMessage({
  messages,
  conversationId,
  agentName,
  addMessage,
}: UseIdleMessageProps) {
  const { misc } = useSettings();
  const t = useTranslations("chat.IdleMessage");
  const [showMessage, setShowMessage] = useState(false);
  const hasConnectedToAgent = useRef(false);
  const timer = useRef<NodeJS.Timeout>();
  const hasDisplayedMessage = useRef(false);
  const analytics = useAnalytics();
  const { agentId } = useParams();
  const surveyLink = misc.handoffConfiguration?.surveyLink;

  /**
   * Removes event listeners and clears the idle timer.
   * Used during cleanup and when the idle message is displayed.
   */
  const cleanup = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }
    IDLE_EVENTS.forEach((event) => {
      window.removeEventListener(event, resetTimer);
    });
  }, []);

  /**
   * Logs idle message display event with relevant metadata.
   */
  const callAnalytics = useCallback(() => {
    analytics.logEvent(MagiEvent.idleMessageDisplay, {
      agentId,
      conversationId: conversationId || "",
      agentConnected: hasConnectedToAgent.current,
    });
  }, [analytics, agentId, conversationId]);

  /**
   * Determines if user has sent any messages in the conversation.
   */
  const userMessagesExist = useMemo(
    () => messages.some((message) => message.type === "USER"),
    [messages],
  );

  /**
   * Tracks agent connection status for analytics and message content.
   */
  useEffect(() => {
    if (agentName && !hasConnectedToAgent.current) {
      hasConnectedToAgent.current = true;
    }
  }, [agentName]);

  /**
   * Memoized idle message content with survey link and conversation metadata.
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
   * Handles the display of the idle message, including analytics and cleanup.
   * Guarded by surveyLink availability check and ensures message is only displayed once.
   */
  const displayMessage = useCallback(() => {
    if (!surveyLink || hasDisplayedMessage.current) return;
    addMessage(idleMessage);
    callAnalytics();
    cleanup();
    hasDisplayedMessage.current = true;
  }, [surveyLink, idleMessage, addMessage, callAnalytics, cleanup]);

  /**
   * Triggers the idle message display when showMessage state changes to true.
   */
  useEffect(() => {
    if (!showMessage) return;
    displayMessage();
  }, [showMessage, displayMessage]);

  /**
   * Manages the idle timer, clearing existing timeouts and setting new ones.
   * Timer is only set if the message hasn't been shown and timeout is configured.
   */
  const resetTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = undefined;
    }

    if (showMessage || hasDisplayedMessage.current) {
      return;
    }

    const timeoutMs = misc.idleMessageTimeout
      ? misc.idleMessageTimeout * 1000
      : undefined;
    if (!timeoutMs) {
      return;
    }

    timer.current = setTimeout(() => {
      setShowMessage(true);
    }, timeoutMs);
  }, [misc.idleMessageTimeout, showMessage]);

  /**
   * Sets up and manages event listeners for user activity tracking.
   * Initializes the idle timer and handles cleanup on unmount or when conditions change.
   */
  useEffect(() => {
    if (
      !misc.idleMessageTimeout ||
      showMessage ||
      hasDisplayedMessage.current ||
      !userMessagesExist ||
      !surveyLink
    ) {
      return cleanup;
    }

    IDLE_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return cleanup;
  }, [
    resetTimer,
    userMessagesExist,
    surveyLink,
    misc.idleMessageTimeout,
    showMessage,
    cleanup,
  ]);
}
