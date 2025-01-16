import { useCallback } from "react";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/dist/client/components/navigation";

interface UseAskQuestionProps {
  conversationId?: string;
  askQuestion: (params: { text: string; type: "USER" }) => void;
  scrollToLatest: () => void;
}

export function useAskQuestion({
  conversationId,
  askQuestion,
  scrollToLatest,
}: UseAskQuestionProps) {
  const { agentId }: { organizationId: string; agentId: string } = useParams();

  const analytics = useAnalytics();

  const ask = useCallback(
    async (question: string) => {
      analytics.logEvent(MagiEvent.chatAskClick, {
        agentId: agentId,
        conversationId: conversationId || "",
      });

      askQuestion({
        text: question,
        type: "USER",
      });

      scrollToLatest();
    },
    [agentId, conversationId, analytics, askQuestion, scrollToLatest],
  );

  return ask;
}
