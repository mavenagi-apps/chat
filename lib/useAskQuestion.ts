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
  const { id: agentFriendlyId }: { orgFriendlyId: string; id: string } =
    useParams();

  const analytics = useAnalytics();

  const ask = useCallback(
    async (question: string) => {
      analytics.logEvent(MagiEvent.chatAskClick, {
        agentId: agentFriendlyId,
        conversationId: conversationId || "",
      });

      askQuestion({
        text: question,
        type: "USER",
      });

      scrollToLatest();
    },
    [agentFriendlyId, conversationId, analytics, askQuestion, scrollToLatest],
  );

  return ask;
}
