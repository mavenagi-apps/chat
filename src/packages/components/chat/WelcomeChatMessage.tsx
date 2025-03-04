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
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return welcomeMessage;
    }
  }, [welcomeMessage, locale]);

  const popularQuestions: string[] = useMemo(() => {
    try {
      if (typeof popularQuestionsJSON === "string") {
        return JSON.parse(popularQuestionsJSON || "[]");
      }
      return (popularQuestionsJSON || [])
        .map((question: string) => {
          // The question is either a string or a JSON string
          try {
            const translationsObject = JSON.parse(question);
            return translationsObject[locale] || translationsObject.en || "";
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error) {
            return question;
          }
        })
        .filter((question: string) => question !== "");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }, [popularQuestionsJSON, locale]);

  const handleQuestionClick = useCallback(
    (question: string) => {
      analytics.logEvent(MagiEvent.popularQuestionClick, {
        agentId: agentId,
        conversationId: conversationId || "",
        question,
      });
      void ask(question);
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
