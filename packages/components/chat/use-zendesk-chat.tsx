import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAnalytics } from '@/lib/use-analytics';
import { MagiEvent } from '@/lib/analytics/events';
import { useSettings } from '@/app/providers/SettingsProvider';
import {
  type ZendeskChatMessage,
  type Message,
  isBotMessage,
  isChatUserMessage,
} from '@/types';

enum SmoochEvent {
  READY = 'ready',
  DESTROY = 'destroy',
  PARTICIPANT_ADDED = 'participant:added',
  PARTICIPANT_REMOVED = 'participant:removed',
  MESSAGE_RECEIVED = 'message:received',
  MESSAGE_SENT = 'message:sent',
  MESSAGE = 'message',
  LOG_DEBUG = 'log:debug',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  TYPING_START = 'typing:start',
}

interface Smooch {
  init: (config: any) => Promise<void>;
  on: (event: string, callback: (data: any) => void) => void;
  render: (div: HTMLDivElement) => void;
  destroy: () => void;
}

interface SmoochMessageSource {
  type: string;
  originalMessageTimestamp: number;
}

interface SmoochMessageMetadata {
  '__zendesk_msg.agent.id': string;
  '__zendesk_msg.client_message_id': string;
}

interface SmoochMessage {
  source: SmoochMessageSource;
  avatarUrl: string;
  type: string;
  received: number;
  metadata: SmoochMessageMetadata;
  text: string;
  id: string;
  displayName: string;
  role: 'business' | 'user';  // Added union type since messages can be from business or user
}

type SmoochEventMap = {
  [SmoochEvent.MESSAGE]: SmoochMessage;
  [SmoochEvent.MESSAGE_RECEIVED]: SmoochMessage;
  [SmoochEvent.CONNECTED]: any;
  [SmoochEvent.DISCONNECTED]: any;
  [SmoochEvent.READY]: any;
  [SmoochEvent.DESTROY]: any;
  [SmoochEvent.LOG_DEBUG]: any;
  [SmoochEvent.PARTICIPANT_ADDED]: any;
  [SmoochEvent.PARTICIPANT_REMOVED]: any;
  [SmoochEvent.MESSAGE_SENT]: any;
  [SmoochEvent.TYPING_START]: any;
  [SmoochEvent.RECONNECTING]: any;
};
type SmoochEventData<T extends SmoochEvent> = SmoochEventMap[T];


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
  const [zendeskChatSessionParams, setZendeskChatSessionParams] = useState<
    any | null
  >(null);
  const [connectedToZendesk, setConnectedToZendesk] = useState(false);
  const zendeskChatAck = useRef<number>(-1);
  const [zendeskError, setZendeskError] = useState<string | null>(null);
  const { zendeskChatIntegrationId, zendeskSubdomain } = useSettings();
  const smoochClientRef = useRef<Smooch | null>(null);

  const messagesForZendesk = useMemo(() => {
    return messages
      .filter((message) => ['USER', 'bot'].includes(message.type))
      .map((message) => {
        return {
          author: {
            type: isChatUserMessage(message) ? 'user' : 'business',
          },
          content: {
            type: 'text',
            text: isChatUserMessage(message)
              ? message.text
              : isBotMessage(message)
                ? message.responses
                    .map((response: any) => response.text)
                    .join('')
                : '',
          },
        };
      });
  }, [messages]);

  // Zendesk chat messages
  const [zendeskChatMessages, setZendeskChatMessages] = useState<
    (ZendeskChatMessage & { timestamp?: number })[]
  >([]);
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [agentName, setAgentName] = useState<string | null>(null);

  const createZendeskChatMessage = useCallback(
    (message: ZendeskChatMessage) => {
      setZendeskChatMessages((prevMessages) => [...prevMessages, message]);
    },
    [setZendeskChatMessages]
  );

  const initializeZendeskChat = useCallback(async () => {
    const div = document.createElement('div');
    div.id = 'smooch-container';
    div.style.display = 'none';
    document.body.appendChild(div);

    Object.values(SmoochEvent).forEach(<T extends SmoochEvent>(event: T) => {
      smoochClientRef.current?.on(event, (data: SmoochEventData<T>) => {
        console.log(event);
        switch (event) {
          case SmoochEvent.CONNECTED:
            setConnectedToZendesk(true);
            break;
          case SmoochEvent.DISCONNECTED:
            setConnectedToZendesk(false);
            break;
          case SmoochEvent.READY:
            break;
          case SmoochEvent.MESSAGE_RECEIVED:
            console.log(event, data);
            // setZendeskChatMessages((prevMessages) => [...prevMessages, data]);
            createZendeskChatMessage({
              type: 'ChatMessage',
              message: {
                text: data.text,
                name: data.displayName,
              },
            });
            setAgentName(data.displayName);
            break;
          default:
            console.log(event, data);
            break;
        }
      });
    });

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

    const {
      conversationId: zendeskConversationId,
      userId: zendeskUserId,
      jwt,
    } = await response.json();

    console.log({
      conversationId: zendeskConversationId,
      userId: zendeskUserId,
      jwt,
    });

    smoochClientRef.current
      ?.init({
        integrationId: zendeskChatIntegrationId,
        configBaseUrl: `https://${zendeskSubdomain ?? ''}.zendesk.com/sc/sdk/`,
        embedded: true,
        externalId: unverifiedUserInfo.email,
        jwt,
        soundNotificationEnabled: false,
      })
      .then(
        () => {},
        (err) => {
          console.error('Smooch init error:', err);
        }
      );

    smoochClientRef.current?.render(div);

    setZendeskChatSessionParams({
      zendeskConversationId,
      zendeskUserId,
    });
  }, [
    params.orgFriendlyId,
    params.id,
    unverifiedUserInfo,
    messagesForZendesk,
    smoochClientRef,
    createZendeskChatMessage,
    zendeskChatIntegrationId,
    zendeskSubdomain,
  ]);

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
    smoochClientRef.current?.destroy();
    setZendeskChatSessionParams(null);
    setAgentName(null);
    createDisconnectedFromZendeskMessage();
    analytics.logEvent(MagiEvent.endChatClick, {
      agentId: params.id,
      conversationId: conversationId || '',
    });
    onZendeskExit();
  };

  const askZendesk = useCallback(
    async (question: string) => {
      try {
        setZendeskChatMessages((prevMessages) => [
          ...prevMessages,
          {
            type: 'USER',
            text: question,
          },
        ]);

        await fetch('/api/zendesk/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            orgFriendlyId: params.orgFriendlyId,
            agentId: params.id,
            conversationId: zendeskChatSessionParams.zendeskConversationId,
            message: question,
            userId: zendeskChatSessionParams.zendeskUserId,
          }),
        });
      } catch (error) {
        console.error('Error asking Zendesk:', error);
      }
    },
    [
      params.orgFriendlyId,
      params.id,
      zendeskChatSessionParams?.zendeskUserId,
      zendeskChatSessionParams?.zendeskConversationId,
      setZendeskChatMessages,
    ]
  );

  const createConnectingToAgentMessage = useCallback(() => {
    createZendeskChatMessage({
      type: 'ChatEstablished',
      message: {
        text: t('connecting_to_agent'),
      },
    });
  }, [createZendeskChatMessage, t]);

  const createConnectedToAgentMessage = useCallback(() => {
    createZendeskChatMessage({
      type: 'ChatTransferred',
      message: {
        text: t('chat_transferred'),
      },
    });
  }, [createZendeskChatMessage, t]);

  const createDisconnectedFromZendeskMessage = useCallback(() => {
    createZendeskChatMessage({
      type: 'ChatEnded',
      message: {
        text: t('chat_has_ended'),
        name: '',
        agentId: '',
      },
    });
  }, [createZendeskChatMessage, t]);

  const passControlToZendesk = useCallback(async () => {
    const response = await fetch('/api/zendesk/conversations/passControl', {
      method: 'POST',
      body: JSON.stringify({
        orgFriendlyId: params.orgFriendlyId,
        agentId: params.id,
        conversationId: zendeskChatSessionParams.zendeskConversationId,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to pass control to Zendesk');
    }

    setAgentName('BritBox');
    createConnectedToAgentMessage();
  }, [
    params.orgFriendlyId,
    params.id,
    zendeskChatSessionParams?.zendeskConversationId,
    createConnectedToAgentMessage,
  ]);

  useEffect(() => {
    if (connectedToZendesk) {
      void passControlToZendesk();
    }
  }, [connectedToZendesk, passControlToZendesk]);

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
    const initSmooch = async () => {
      if (!smoochClientRef.current) {
        try {
          // @ts-expect-error - smooch is not in the types
          const smoochModule = await import('smooch');
          smoochClientRef.current = smoochModule.default as Smooch;
          console.log('Smooch client initialized', smoochClientRef.current, smoochModule);
        } catch (error) {
          console.error('Failed to load Smooch:', error);
          throw new Error('Smooch client not found');
        }
      }
    };

    void initSmooch();
    
    return () => {
      void handleEndZendeskChatMode();
    };
  }, []);

  useEffect(() => {
    const lastMessage = zendeskChatMessages[zendeskChatMessages.length - 1];
    if (
      lastMessage &&
      ['AgentTyping', 'AgentNotTyping'].includes(lastMessage.type)
    ) {
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
