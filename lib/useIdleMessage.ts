import { useEffect, useRef, useCallback, useMemo } from "react";
import type { ChatMessage, CombinedMessage } from "@/types";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/navigation";
import { useSettings } from "@/app/providers/SettingsProvider";

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

export function useIdleMessage({
  messages,
  conversationId,
  agentName,
  addMessage,
}: UseIdleMessageProps) {
  const { misc } = useSettings();
  const t = useTranslations("chat.IdleMessage");
  const hasShownMessage = useRef(false);
  const hasConnectedToAgent = useRef(false);
  const timer = useRef<NodeJS.Timeout>();
  const analytics = useAnalytics();
  const { agentId } = useParams();
  const surveyLink = misc.handoffConfiguration?.surveyLink;

  const callAnalytics = useCallback(() => {
    analytics.logEvent(MagiEvent.idleMessageDisplay, {
      agentId,
      conversationId: conversationId || "",
      agentConnected: hasConnectedToAgent.current,
    });
  }, [analytics, agentId, conversationId]);

  const userMessagesExist = useMemo(
    () => messages.some((message) => message.type === "USER"),
    [messages],
  );

  useEffect(() => {
    if (agentName && !hasConnectedToAgent.current) {
      hasConnectedToAgent.current = true;
    }
  }, [agentName]);

  const resetTimer = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
    }

    const timeoutInMs = misc.idleMessageTimeout
      ? misc.idleMessageTimeout * 1000
      : undefined;

    if (!timeoutInMs) {
      return;
    }

    timer.current = setTimeout(() => {
      if (!hasShownMessage.current) {
        const idleMessage: ChatMessage = {
          text: t("idle_message_with_survey", {
            url: surveyLink,
            urlParams: `?chatKey=${conversationId}&agentConnected=${hasConnectedToAgent.current ? "Yes" : "No"}`,
          }),
          type: "SIMULATED",
        };

        addMessage(idleMessage);
        hasShownMessage.current = true;
        callAnalytics();
      }
    }, timeoutInMs);
  }, [
    misc.idleMessageTimeout,
    conversationId,
    t,
    callAnalytics,
    surveyLink,
    addMessage,
  ]);

  useEffect(() => {
    // Return early if feature is disabled or conditions aren't met
    if (
      !misc.idleMessageTimeout ||
      hasShownMessage.current ||
      !userMessagesExist ||
      !surveyLink
    ) {
      return;
    }

    const cleanup = () => {
      if (timer.current) {
        clearTimeout(timer.current);
      }
      IDLE_EVENTS.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
    };

    IDLE_EVENTS.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    resetTimer();

    return cleanup;
  }, [resetTimer, userMessagesExist, surveyLink, misc.idleMessageTimeout]);
}
