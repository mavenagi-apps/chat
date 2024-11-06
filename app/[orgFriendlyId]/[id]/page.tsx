'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';

import Chat from '@magi/components/chat/Chat';
import Animation from '@magi/components/Animation';
import typingIndicator from '@magi/components/chat/typing-indicator.json';
import { ChatMessage } from '@magi/components/chat/ChatMessage';
import { ChatBubble } from '@magi/components/chat/ChatCard';
import { ChatInput } from '@magi/components/chat/ChatInput';
import { useChat } from '@magi/components/chat/use-chat';
import { useIdleTimeout } from '@magi/components/chat/use-idle-timeout';
import { useZendeskChat } from '@magi/components/chat/use-zendesk-chat';
import { useUnverifiedUserInfo } from '@magi/components/chat/use-unverified-user-info';
import { ReactMarkdown } from '@magi/components/ReactMarkdown';
import Spinner from '@magi/components/Spinner';
import { Logo } from '@magi/components/Logo';
import { MagiEvent } from '@/lib/analytics/events';
import { useAnalytics } from '@/lib/use-analytics';
import { useSettings } from '@/app/providers/SettingsProvider';

import { SalesforceChatInput } from '@magi/components/chat/SalesforceChatInput';

import {
  type Message,
  type SalesforceChatMessage,
  type ZendeskChatMessage,
  type SimulatedChatMessage,
} from '@/types';

interface Props {
  params: {
    orgFriendlyId: string; // Organization ID
    id: string; // Agent ID
  };
}

function ChatPage({ params }: Props) {
  // Analytics
  const analytics = useAnalytics();

  // i18n
  const t = useTranslations('chat.ChatPage');
  const { popularQuestions: popularQuestionsJSON, brandColor, logoUrl, surveyLink } = useSettings();
  const popularQuestions: string[] = useMemo(() => {
    try {
      return JSON.parse(popularQuestionsJSON || '[]');
    } catch (error) {
      return [];
    }
  }, [popularQuestionsJSON]);

  // Unverified user info
  const unverifiedUserInfo = useUnverifiedUserInfo();

  // Maven chat logic
  const {
    messages,
    isLoading,
    isResponseAvailable,
    askQuestion,
    conversationId,
  } = useChat({
    ...params,
    unverifiedUserInfo,
  });

  // UI scrolling logic
  const latestChatBubbleRef = React.useRef<HTMLDivElement>(null);
  const scrollLatestChatBubbleIntoView = () => {
    setTimeout(
      () =>
        latestChatBubbleRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        }),
      100
    );
  };

  const displayIdleMessage = useCallback(
    (onSalesforceExit = false) => {
      const IDLE_MESSAGE = (conversationId: string): SimulatedChatMessage => ({
        text: t('idle_message_with_survey', {
          url: surveyLink,
          urlParams: `?conversationId=${conversationId}`,
        }),
        type: 'SIMULATED',
      });

      askQuestion(IDLE_MESSAGE(conversationId));
      setShowIdleMessage(true);
      analytics.logEvent(MagiEvent.idleMessageDisplay, {
        agentId: params.id,
        conversationId: conversationId || '',
        onSalesforceExit,
      });
    },
    [conversationId, params.id, askQuestion, t, analytics, surveyLink]
  );

  // Zendesk chat logic
  const {
    isZendeskChatMode,
    // connectedToZendesk,
    zendeskChatMessages,
    agentName: zendeskAgentName,
    handleZendeskChatMode,
    handleEndZendeskChatMode,
    askZendesk,
    showTypingIndicator: showZendeskTypingIndicator,
    // createConnectingToAgentMessage: zendeskCreateConnectingToAgentMessage,
    // zendeskError,
  } = useZendeskChat(
    params,
    conversationId,
    unverifiedUserInfo,
    messages,
    () => {
      displayIdleMessage(true)
      setShowIdleMessage(true);
    }
  );

  const [combinedMessages, setCombinedMessages] = useState<(Message | SalesforceChatMessage | ZendeskChatMessage)[]>([]);

  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);

  const idleTimeoutMilliseconds = 30000; // 30 seconds
  const { isIdle } = useIdleTimeout({
    timeout: idleTimeoutMilliseconds,
    isExternalProviderChatMode: isZendeskChatMode,
    isWaitingForChatResponse: isLoading,
    hasUserSentFirstMessage,
  });

  const ask = async (question: string) => {
    setHasUserSentFirstMessage(true);
    analytics.logEvent(MagiEvent.chatAskClick, {
      agentId: params.id,
      conversationId: conversationId || '',
    });
    askQuestion({
      text: question,
      type: 'USER',
    });
    scrollLatestChatBubbleIntoView();
  };

  useEffect(() => {
    analytics.logEvent(MagiEvent.chatHomeView, { agentId: params.id });
  }, [params.id, analytics]);

  useEffect(() => {
    setCombinedMessages(
      [...messages, ...zendeskChatMessages]
        .filter(({ timestamp }) => !!timestamp)
        .sort(
          (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
        )
    );
    scrollLatestChatBubbleIntoView();
  }, [messages, zendeskChatMessages, setCombinedMessages]);

  // Idle logic
  const [showIdleMessage, setShowIdleMessage] = useState<boolean>(false);

  useEffect(() => {
    if (isIdle && !showIdleMessage) {
      displayIdleMessage();
    }
  }, [
    displayIdleMessage,
    isIdle,
    showIdleMessage,
  ]);

  return (
    <main className='flex h-screen flex-col bg-gray-50'>
      <div className='border-b border-gray-300 bg-white md:block'>
        <div className='text-md flex p-5 font-medium text-gray-950'>
          <Image
            src={
              logoUrl ||
              'https://app.mavenagi.com/_next/image?url=%2Fapi%2Fv1%2Ffiles%2Fage_CSMoGtyyQNJ0z8XzyMXK2Jbk%2Flogo%3F1730414949621&w=256&q=75'
            }
            alt='Logo'
            width={98}
            height={24}
          />
        </div>
      </div>

      <Chat brandColor={brandColor} messages={messages} askFn={ask}>
        <div className='flex flex-1 flex-col overflow-auto text-xs'>
          <div className='mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5'>
            <ChatBubble direction='full' key='popular_questions'>
              <div className='flex flex-col'>
                <div className='mb-2 whitespace-pre-wrap'>
                  <ReactMarkdown linkTargetInNewTab>
                    {t('default_welcome_message')}
                  </ReactMarkdown>
                </div>
                {popularQuestions.slice(0, 3).map((question, index) => (
                  <div
                    className='my-1 cursor-pointer underline'
                    key={index}
                    onClick={() => {
                      analytics.logEvent(MagiEvent.popularQuestionClick, {
                        agentId: params.id,
                        conversationId: conversationId || '',
                        question,
                      });
                      void ask(question);
                    }}
                  >
                    {question}
                  </div>
                ))}
              </div>
            </ChatBubble>

            {combinedMessages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message}
                isLastMessage={index === combinedMessages.length - 1}
                latestChatBubbleRef={latestChatBubbleRef}
                conversationId={conversationId}
                unverifiedUserInfo={unverifiedUserInfo}
                onSalesforceChatMode={() => {
                  void handleZendeskChatMode();
                  analytics.logEvent(MagiEvent.bailoutActionClick, {
                    agentId: params.id,
                    conversationId: conversationId || '',
                  });
                }}
              />
            ))}

            {isLoading && !isResponseAvailable && (
              <div className='my-5'>
                <Spinner color={'#000000'} />
              </div>
            )}

            {isZendeskChatMode &&
              zendeskAgentName &&
              showZendeskTypingIndicator && (
                <div className='my-5 flex items-center h-auto'>
                  <div className='shrink-0 p-0 m-0'>
                    <Animation
                      animationData={typingIndicator}
                      alignLeft={true}
                      height={'24px'}
                      width={'40px'}
                    />
                  </div>
                  <span className='ml-2'>{t('agent_typing')}</span>
                </div>
              )}
          </div>
          {combinedMessages.length === 0 && !isLoading && (
            <div className='flex h-20 w-full items-center text-center'>
              <div className='mx-auto flex items-center text-xs text-gray-400'>
                Powered by{' '}
                <a href='https://www.mavenagi.com' target='_blank'>
                  <Logo className='ml-1 h-6' width={82} height={24} />
                </a>
              </div>
            </div>
          )}
        </div>
        {!isZendeskChatMode ? (
          <ChatInput
            questionPlaceholder={'question_placeholder'}
            isSubmitting={isLoading}
            data-testid='chat-input'
          />
        ) : (
          <SalesforceChatInput
            questionPlaceholder={'question_placeholder'}
            isSubmitting={isLoading}
            askFn={askZendesk}
            data-testid='chat-input'
            agentName={zendeskAgentName || null}
            handleEndChat={handleEndZendeskChatMode}
          />
        )}
      </Chat>
    </main>
  );
}

export default function ChatPageWrapper(props: Props) {
  const [loading, setLoading] = useState(true);
  const { orgFriendlyId, id } = props.params;

  useEffect(() => {
    const isInIframe = () => {
      try {
        return window.self !== window.top;
      } catch (e) {
        return true;
      }
    };
    if (!isInIframe()) {
      window.location.href = `/demo/${orgFriendlyId}/${id}`;
    } else {
      setLoading(false);
    }
  }, [orgFriendlyId, id]);

  if (loading) {
    return null;
  }

  return <ChatPage {...props} />;
}
