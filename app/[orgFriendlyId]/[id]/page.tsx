'use client';

import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import Script from 'next/script';

import Chat from '@magi/components/chat/Chat';
import Animation from '@magi/components/Animation';
import typingIndicator from '@magi/components/chat/typing-indicator.json';
import { ChatMessage } from '@magi/components/chat/ChatMessage';
import { ChatBubble } from '@magi/components/chat/ChatCard';
import { ChatInput } from '@magi/components/chat/ChatInput';
import { useChat } from '@magi/components/chat/use-chat';
import { useIdleTimeout } from '@magi/components/chat/use-idle-timeout';
import { useSalesforceChat } from '@magi/components/chat/use-salesforce-chat';
import { useUnverifiedUserInfo } from '@magi/components/chat/use-unverified-user-info';
import { ReactMarkdown } from '@magi/components/ReactMarkdown';
import Spinner from '@magi/components/Spinner';
import { Logo } from '@magi/components/Logo';
import { MagiEvent } from '@/lib/analytics/events';
import { useAnalytics } from '@/lib/use-analytics';

import { SalesforceChatInput } from '@magi/components/chat/SalesforceChatInput';

import {
  isChatUserMessage,
  type Message,
  type SalesforceChatMessage,
  type SimulatedChatMessage,
  type UserChatMessage,
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
  const POPULAR_QUESTIONS = [
    t('popular_question_1'),
    t('popular_question_2'),
    t('popular_question_3'),
  ];

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

  // First user message (for Salesforce chat subject)
  const [initialUserChatMessage, setInitialUserChatMessage] =
    useState<UserChatMessage | null>(null);
  useEffect(() => {
    // get the first user message
    const firstUserMessage: UserChatMessage | undefined = messages.find(
      (message) => isChatUserMessage(message)
    );
    if (firstUserMessage) {
      setInitialUserChatMessage(firstUserMessage);
    }
  }, [messages]);

  const displayIdleMessage = useCallback(
    (onSalesforceExit = false) => {
      const IDLE_MESSAGE = (conversationId: string): SimulatedChatMessage => ({
        text: t('idle_message_with_survey', {
          conversationId,
          additionalUrlParams: `&agentConnected=${onSalesforceExit ? 'Yes' : 'No'}`,
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
    [conversationId, params.id, askQuestion, t, analytics]
  );

  // Salesforce chat logic
  const {
    isSalesforceChatMode,
    salesforceChatMessages,
    agentName,
    handleSalesforceChatMode,
    handleEndSalesforceChatMode,
    askSalesForce,
    showTypingIndicator,
  } = useSalesforceChat(
    params,
    conversationId,
    initialUserChatMessage,
    unverifiedUserInfo,
    messages,
    () => {
      displayIdleMessage(true)
      setShowIdleMessage(true);
    }
  );

  const [combinedMessages, setCombinedMessages] = useState<(Message | SalesforceChatMessage)[]>([]);

  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);

  const idleTimeoutMilliseconds = 30000; // 30 seconds
  const { isIdle } = useIdleTimeout({
    timeout: idleTimeoutMilliseconds,
    isSalesforceChatMode,
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
      [...messages, ...salesforceChatMessages]
        .filter(({ timestamp }) => !!timestamp)
        .sort(
          (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
        )
    );
    scrollLatestChatBubbleIntoView();
  }, [messages, salesforceChatMessages, setCombinedMessages]);

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
          {/* TODO(doll): Many of our customer images are SVGs which NextJs doesn't support well by default */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt='Logo'
            src='https://app.mavenagi.com/api/v1/files/age_CSMoGtyyQNzJyoJdFkdPfOXw/logo?1723509365729&w=256&q=75'
            className='h-7'
          />
        </div>
      </div>

      <Chat brandColor='#004f32' messages={messages} askFn={ask}>
        <div className='flex flex-1 flex-col overflow-auto text-xs'>
          <div className='mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5'>
            <ChatBubble direction='full' key='popular_questions'>
              <div className='flex flex-col'>
                <div className='mb-2 whitespace-pre-wrap'>
                  <ReactMarkdown linkTargetInNewTab>
                    {t('default_welcome_message')}
                  </ReactMarkdown>
                </div>
                {POPULAR_QUESTIONS.slice(0, 3).map((question, index) => (
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
                  handleSalesforceChatMode();
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

            {isSalesforceChatMode && agentName && showTypingIndicator && (
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
        {!isSalesforceChatMode ? (
          <ChatInput
            questionPlaceholder={'question_placeholder'}
            isSubmitting={isLoading}
            data-testid='chat-input'
          />
        ) : (
          <SalesforceChatInput
            questionPlaceholder={'question_placeholder'}
            isSubmitting={isLoading}
            askFn={askSalesForce}
            data-testid='chat-input'
            agentName={agentName || null}
            handleEndChat={handleEndSalesforceChatMode}
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

  return (
    <>
      <Script src='/js/zendesk-chat-web-sdk.js' strategy='lazyOnload' />
      <ChatPage {...props} />
    </>
  );
}
