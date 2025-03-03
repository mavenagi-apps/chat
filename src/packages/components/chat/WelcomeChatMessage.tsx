import { useLocale, useTranslations } from "next-intl";
import { ReactMarkdown } from "@magi/components/ReactMarkdown";
import { ChatBubble } from "@magi/components/chat/ChatCard";
import { MagiEvent } from "@/src/lib/analytics/events";
import { useAnalytics } from "@/src/lib/use-analytics";
import { useCallback, useMemo, useContext } from "react";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import { ChatContext } from "./Chat";

interface WelcomeMessageProps {
  agentId: string;
  conversationId?: string;
}

export function WelcomeMessage({
  agentId,
  conversationId,
}: WelcomeMessageProps) {
  const t = useTranslations("chat.ChatPage");
  const locale = useLocale();
  const analytics = useAnalytics();
  const { ask } = useContext(ChatContext);

  const { branding } = useSettings();
  const { popularQuestions: popularQuestionsJSON, welcomeMessage } = branding;

  const welcomeMessageParsed = useMemo((): string | null => {
    if (!welcomeMessage) {
      return null;
    }

    try {
      const parsed = JSON.parse(welcomeMessage);
      return parsed[locale] || parsed.en || "";
    } catch (error) {
      return welcomeMessage;
    }
  }, [welcomeMessage, locale]);

  const popularQuestions: string[] = useMemo(() => {
    try {
      if (typeof popularQuestionsJSON === "string") {
        return JSON.parse(popularQuestionsJSON || "[]");
      }
      return popularQuestionsJSON || [];
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }, [popularQuestionsJSON]);

  const handleQuestionClick = useCallback(
    (question: string) => {
      analytics.logEvent(MagiEvent.popularQuestionClick, {
        agentId: agentId,
        conversationId: conversationId || "",
        question,
      });
      ask(question);
    },
    [analytics, agentId, conversationId, ask],
  );

  return (
    <ChatBubble direction="full" key="popular_questions">
      <div className="flex flex-col">
        <div className="mb-2 whitespace-pre-wrap">
          <ReactMarkdown linkTargetInNewTab>
            {welcomeMessageParsed || t("default_welcome_message")}
          </ReactMarkdown>
        </div>
        {popularQuestions.slice(0, 3).map((question, index) => (
          <div
            className="my-1 cursor-pointer underline"
            key={index}
            onClick={() => handleQuestionClick(question)}
          >
            {question}
          </div>
        ))}
      </div>
    </ChatBubble>
  );
}
