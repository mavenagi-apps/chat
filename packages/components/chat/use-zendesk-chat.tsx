import { useState, useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { useAnalytics } from '@/lib/use-analytics';
import { MagiEvent } from '@/lib/analytics/events';
import {
  type UserChatMessage,
  type ZendeskChatMessage,
} from '@/types';

export const useZendeskChat = (
  params: { id: string, orgFriendlyId: string },
  conversationId: string | null,
  initialUserChatMessage: UserChatMessage | null,
  unverifiedUserInfo: Record<string, string>,
  messages: any[],
  onZendeskExit: () => void
) => {
  // Init dependencies
  const t = useTranslations('chat.ChatPage');
  const analytics = useAnalytics();

  // Zendesk connection states
  const [isZendeskChatMode, setIsZendeskChatMode] = useState(false);
  const isZendeskChatModeRef = useRef(isZendeskChatMode);
  const zendeskPollingAbortController = useRef<AbortController | null>(null);
  const [zendeskChatSessionParams, setZendeskChatSessionParams] = useState<any | null>(null);
  const [connectingToZendesk, setConnectingToZendesk] = useState(false);
  const [connectedToZendesk, setConnectedToZendesk] = useState(false);
  const zendeskChatAck = useRef<number>(-1);
  const [zendeskError, setZendeskError] = useState<string | null>(null);

  // Zendesk chat messages
  const [zendeskChatMessages, setZendeskChatMessages] = useState<
    (ZendeskChatMessage & { timestamp?: number })[]
  >([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);

  const handleZendeskChatMode = async () => {
    setIsZendeskChatMode(true);
    setConnectingToZendesk(true);
    createConnectingToAgentMessage();

    const userData = {
      userAgent: navigator.userAgent,
      screenResolution: `${window.screen.width}x${window.screen.height}`,
      subject: initialUserChatMessage?.text || 'How can I help you today?',
      firstName: unverifiedUserInfo?.firstName || '',
      lastName: unverifiedUserInfo?.lastName || '',
      email: unverifiedUserInfo?.email || '',
    };

    try {
      const chatSessionRequest = await fetch('/api/zendesk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userData,
          orgFriendlyId: params.orgFriendlyId,
          agentId: params.id,
        }),
      });

      if (!chatSessionRequest.ok) {
        throw new Error(`Failed to initiate chat session: ${chatSessionRequest.statusText}`);
      }

      const chatSessionData = await chatSessionRequest.json();
      setZendeskChatSessionParams(chatSessionData);
      setConnectedToZendesk(true);
      setZendeskError(null);

      void pollMessages(chatSessionData);
    } catch (error) {
      console.error('Error starting Zendesk chat:', error);
      setZendeskError('Failed to start chat session');
      setConnectingToZendesk(false);
    }
  };

  const handleEndZendeskChatMode = async () => {
    setIsZendeskChatMode(false);
    setConnectingToZendesk(false);
    setConnectedToZendesk(false);
    zendeskPollingAbortController.current?.abort();
    zendeskChatAck.current = -1;
    if (zendeskChatSessionParams) {
      try {
        await fetch('/api/zendesk', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'X-ZENDESK-SESSION-ID': zendeskChatSessionParams.sessionId,
          },
        });
      } catch(error) {
        console.error('Error ending Zendesk chat:', error);
      }
    }
    setZendeskChatSessionParams(null);
    setAgentName(null);
    createDisconnectedFromZendeskMessage();
    analytics.logEvent(MagiEvent.endChatClick, {
      agentId: params.id,
      conversationId: conversationId || '',
    });
    onZendeskExit();
  };

  const askZendesk = async (question: string) => {
    try {
      setZendeskChatMessages((prevMessages) => [
        ...prevMessages,
        {
          id: Date.now().toString(),
          type: 'text',
          text: question,
          author: {
            type: 'user',
            userId: zendeskChatSessionParams.userId,
          },
          createdAt: new Date().toISOString(),
        },
      ]);

      await fetch('/api/zendesk/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-ZENDESK-SESSION-ID': zendeskChatSessionParams.sessionId,
        },
        body: JSON.stringify({
          text: question,
          userId: zendeskChatSessionParams.userId,
        }),
      });
    } catch (error) {
      console.error('Error asking Zendesk:', error);
    }
  };

  const createZendeskChatMessage = (message: ZendeskChatMessage) => {
    setZendeskChatMessages((prevMessages) => [
      ...prevMessages,
      message,
    ]);
  };

  const createConnectingToAgentMessage = () => {
    createZendeskChatMessage({
      type: 'ChatEstablished',
      message: {
        text: t('connecting_to_agent'),
      },
    });
  };

  const createDisconnectedFromZendeskMessage = () => {
    createZendeskChatMessage({
      type: 'ChatEnded',
      message: {
        text: t('chat_has_ended'),
        name: '',
        agentId: '',
      },
    });
  };

  const pollMessages = async (chatSessionData: any) => {
    const url = '/api/zendesk/messages';
    zendeskPollingAbortController.current = new AbortController();
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-ZENDESK-SESSION-ID': chatSessionData.sessionId,
        },
        signal: zendeskPollingAbortController.current.signal,
      });
      zendeskPollingAbortController.current = null;

      if (!response.ok) {
        console.error('Done polling messages:', response);
        setConnectedToZendesk(false);
        return;
      }

      const { messages: retrievedZendeskMessages, sequence } = await response.json();

      if (sequence > zendeskChatAck.current) {
        zendeskChatAck.current = sequence;
      }

      if (retrievedZendeskMessages.length > 0) {
        setZendeskChatMessages((prevMessages) => [
          ...prevMessages,
          ...retrievedZendeskMessages,
        ]);
      }

      if (isZendeskChatModeRef.current) {
        setTimeout(() => void pollMessages(chatSessionData), 3000); // Poll every 3 seconds
      }
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Polling aborted');
      } else {
        throw error;
      }
    }
  };

  useEffect(() => {
    const timestamp = new Date().getTime();
    setZendeskChatMessages((prevMessages) =>
      prevMessages.map((m) => ({
        timestamp,
        ...m,
      }))
    );
  }, [zendeskChatMessages.length, setZendeskChatMessages]);

  useEffect(() => {
    isZendeskChatModeRef.current = isZendeskChatMode;
  }, [isZendeskChatMode]);

  useEffect(() => {
    return () => {
      void handleEndZendeskChatMode();
    };
  }, []);

  useEffect(() => {
    const lastMessage = zendeskChatMessages[zendeskChatMessages.length - 1];
    if (lastMessage && ['AgentTyping', 'AgentNotTyping'].includes(lastMessage.type)) {
      setShowTypingIndicator(lastMessage.type === 'AgentTyping');
    }
  }, [zendeskChatMessages]);

  return {
    isZendeskChatMode,
    connectedToZendesk,
    zendeskChatMessages,
    agentName,
    handleZendeskChatMode,
    handleEndZendeskChatMode,
    askZendesk,
    showTypingIndicator,
    createConnectingToAgentMessage,
    zendeskError,
  };
};
