import { useCallback } from "react";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/dist/client/components/navigation";
import { type Attachment } from "mavenagi/api";

interface UseAskQuestionProps {
  conversationId?: string;
  askQuestion: (params: {
    text: string;
    type: "USER";
    attachments?: Attachment[];
  }) => void;
  scrollToLatest: () => void;
}

export function useAskQuestion({
  conversationId,
  askQuestion,
  scrollToLatest,
}: UseAskQuestionProps) {
  const { agentId }: { organizationId: string; agentId: string } = useParams();

  const analytics = useAnalytics();

  return useCallback(
    async (question: string, attachments?: Attachment[]) => {
      analytics.logEvent(MagiEvent.chatAskClick, {
        agentId: agentId,
        conversationId: conversationId || "",
      });

      askQuestion({
        text: question,
        type: "USER",
        attachments,
      });

      scrollToLatest();
    },
    [agentId, conversationId, analytics, askQuestion, scrollToLatest],
  );
}
