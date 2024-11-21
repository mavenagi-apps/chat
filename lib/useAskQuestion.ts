import { useCallback } from 'react';
import { useAnalytics } from '@/lib/use-analytics';
import { MagiEvent } from '@/lib/analytics/events';

interface UseAskQuestionProps {
  agentFriendlyId: string;
  conversationId?: string;
  askQuestion: (params: { text: string; type: 'USER' }) => void;
  scrollToLatest: () => void;
}

export function useAskQuestion({
  agentFriendlyId,
  conversationId,
  askQuestion,
  scrollToLatest,
}: UseAskQuestionProps) {
  const analytics = useAnalytics();

  const ask = useCallback(
    async (question: string) => {
      analytics.logEvent(MagiEvent.chatAskClick, {
        agentId: agentFriendlyId,
        conversationId: conversationId || '',
      });

      askQuestion({
        text: question,
        type: 'USER',
      });

      scrollToLatest();
    },
    [agentFriendlyId, conversationId, analytics, askQuestion, scrollToLatest]
  );

  return ask;
}
