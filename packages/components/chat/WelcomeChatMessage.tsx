import { useTranslations } from "next-intl";
import { ReactMarkdown } from "@magi/components/ReactMarkdown";
import { ChatBubble } from "@magi/components/chat/ChatCard";
import { MagiEvent } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/use-analytics";
import { useCallback, useMemo, useContext } from "react";
import { useSettings } from "@/app/providers/SettingsProvider";
import { ChatContext } from "./Chat";

interface WelcomeMessageProps {
  agentFriendlyId: string;
  conversationId?: string;
}

export function WelcomeMessage({
  agentFriendlyId,
  conversationId,
}: WelcomeMessageProps) {
  const t = useTranslations("chat.ChatPage");
  const analytics = useAnalytics();
  const { ask } = useContext(ChatContext);

  const { popularQuestions: popularQuestionsJSON } = useSettings();
  const popularQuestions: string[] = useMemo(() => {
    try {
      return JSON.parse(popularQuestionsJSON || "[]");
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }, [popularQuestionsJSON]);

  const handleQuestionClick = useCallback(
    (question: string) => {
      analytics.logEvent(MagiEvent.popularQuestionClick, {
        agentId: agentFriendlyId,
        conversationId: conversationId || "",
        question,
      });
      ask(question);
    },
    [analytics, agentFriendlyId, conversationId, ask],
  );

  return (
    <ChatBubble direction="full" key="popular_questions">
      <div className="flex flex-col">
        <div className="mb-2 whitespace-pre-wrap">
          <ReactMarkdown linkTargetInNewTab>
            {t("default_welcome_message")}
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
