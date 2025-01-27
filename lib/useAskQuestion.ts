import { useCallback } from "react";
import { useAnalytics } from "@/lib/use-analytics";
import { MagiEvent } from "@/lib/analytics/events";
import { useParams } from "next/dist/client/components/navigation";
import { type Attachment } from "mavenagi/api";

interface UseAskQuestionProps {
  conversationId?: string;
  addMessage: (params: {
    text: string;
    type: "USER";
    attachments?: Attachment[];
  }) => void;
}

export function useAskQuestion({
  conversationId,
  addMessage,
}: UseAskQuestionProps) {
  const { agentId }: { organizationId: string; agentId: string } = useParams();

  const analytics = useAnalytics();

  return useCallback(
    async (question: string, attachments?: Attachment[]) => {
      analytics.logEvent(MagiEvent.chatAskClick, {
        agentId,
        conversationId: conversationId || "",
      });

      addMessage({
        text: question,
        type: "USER",
        attachments,
      });
    },
    [agentId, conversationId, analytics, addMessage],
  );
}
