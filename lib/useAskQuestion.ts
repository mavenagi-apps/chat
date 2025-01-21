import { useCallback } from "react";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/dist/client/components/navigation";

interface UseAskQuestionProps {
  conversationId?: string;
  addMessage: (params: { text: string; type: "USER" }) => void;
}

export function useAskQuestion({
  conversationId,
  addMessage,
}: UseAskQuestionProps) {
  const { agentId }: { organizationId: string; agentId: string } = useParams();

  const analytics = useAnalytics();

  const ask = useCallback(
    async (question: string) => {
      analytics.logEvent(MagiEvent.chatAskClick, {
        agentId,
        conversationId: conversationId || "",
      });

      addMessage({
        text: question,
        type: "USER",
      });
    },
    [agentId, conversationId, analytics, addMessage],
  );

  return ask;
}
