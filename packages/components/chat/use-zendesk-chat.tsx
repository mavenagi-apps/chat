import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAnalytics } from '@/lib/use-analytics';
import { MagiEvent } from '@/lib/analytics/events';
import {
  type ZendeskChatMessage,
  type Message,
  isBotMessage,
  isChatUserMessage,
} from '@/types';

declare global {
  interface Window {
    zChat: {
      init: (config: any) => void;
      sendChatMsg: (message: string, callback?: (err?: string) => void) => void;
      on: (event: string, callback: (data: any) => void) => void;
      setVisitorInfo: (visitorInfo: any, callback?: (err?: string) => void) => void;
      getAccountStatus: () => any;
    };
  }
}

export const useZendeskChat = (
  params: { id: string, orgFriendlyId: string },
  conversationId: string | null,
  unverifiedUserInfo: Record<string, string>,
  messages: Message[],
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
  const [connectedToZendesk, setConnectedToZendesk] = useState(false);
  const zendeskChatAck = useRef<number>(-1);
  const [zendeskError, setZendeskError] = useState<string | null>(null);

  const messagesForZendesk = useMemo(() => {
    return messages.filter((message) => ['USER', 'bot'].includes(message.type)).map((message) => {
      return {
        author: {
          type: isChatUserMessage(message) ? 'user' : 'business',
        },
        content: {
          type: 'text',
          text: isChatUserMessage(message)
            ? message.text
            : isBotMessage(message)
              ? message.responses.map((response: any) => response.text).join('')
              : '',
        },
      }
    });
  }, [messages]);

  const initializeZendeskChat = useCallback(async () => {
    const response = await fetch('/api/zendesk/conversations', {
      method: 'POST',
      body: JSON.stringify({
        orgFriendlyId: params.orgFriendlyId,
        agentId: params.id,
        unverifiedUserInfo,
        messages: messagesForZendesk,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to initialize Zendesk chat');
    }

    const { conversationId: zendeskConversationId } = await response.json();
    setZendeskChatSessionParams({
      zendeskConversationId,
    });
  }, [params.orgFriendlyId, params.id, unverifiedUserInfo, messagesForZendesk])

  // Zendesk chat messages
  const [zendeskChatMessages, setZendeskChatMessages] = useState<
    (ZendeskChatMessage & { timestamp?: number })[]
  >([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);

  const handleZendeskChatMode = async () => {
    setIsZendeskChatMode(true);
    // setConnectingToZendesk(true);
    createConnectingToAgentMessage();

    try {
      await initializeZendeskChat();

    } catch (error) {
      console.error('Error starting Zendesk chat:', error);
      setZendeskError('Failed to start chat session');
      // setConnectingToZendesk(false);
    }
  };

  const handleEndZendeskChatMode = async () => {
    setIsZendeskChatMode(false);
    // setConnectingToZendesk(false);
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
