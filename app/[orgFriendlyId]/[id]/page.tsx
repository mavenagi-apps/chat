'use client';

import * as React from 'react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import Chat from '@magi/components/chat/Chat';
import { ChatMessage } from '@magi/components/chat/ChatMessage';
import { ChatBubble } from '@magi/components/chat/ChatCard';
import { ChatInput } from '@magi/components/chat/ChatInput';
import { useChat } from '@magi/components/chat/use-chat';
import { useIdleTimeout } from '@magi/components/chat/use-idle-timeout';
import { useUnverifiedUserInfo } from '@magi/components/chat/use-unverified-user-info';
import { ReactMarkdown } from '@magi/components/ReactMarkdown';
import Spinner from '@magi/components/Spinner';
import { Logo } from '@magi/components/Logo';
import { MagiEvent } from '@/lib/analytics/events';
import { useAnalytics } from '@/lib/use-analytics';
import { useSettings } from '@/app/providers/SettingsProvider';

import {
  type Message,
  type SalesforceChatMessage,
  type ZendeskChatMessage,
  type SimulatedChatMessage,
} from '@/types';

function ChatPage() {
  // Analytics
  const analytics = useAnalytics();
  const { orgFriendlyId, id: agentFriendlyId }: { orgFriendlyId: string, id: string } = useParams();

  // i18n
  const t = useTranslations('chat.ChatPage');
  const { popularQuestions: popularQuestionsJSON, brandColor, logoUrl, surveyLink } = useSettings();
  const popularQuestions: string[] = useMemo(() => {
    try {
      return JSON.parse(popularQuestionsJSON || '[]');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    orgFriendlyId,
    id: agentFriendlyId,
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
        agentId: agentFriendlyId,
        conversationId: conversationId || '',
        onSalesforceExit,
      });
    },
    [conversationId, agentFriendlyId, askQuestion, t, analytics, surveyLink]
  );

  const [combinedMessages, setCombinedMessages] = useState<(Message | SalesforceChatMessage | ZendeskChatMessage)[]>([]);

  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);

  const idleTimeoutMilliseconds = 30000; // 30 seconds
  const { isIdle } = useIdleTimeout({
    timeout: idleTimeoutMilliseconds,
    isExternalProviderChatMode: false,
    isWaitingForChatResponse: isLoading,
    hasUserSentFirstMessage,
  });

  const ask = async (question: string) => {
    setHasUserSentFirstMessage(true);
    analytics.logEvent(MagiEvent.chatAskClick, {
      agentId: agentFriendlyId,
      conversationId: conversationId || '',
    });
    askQuestion({
      text: question,
      type: 'USER',
    });
    scrollLatestChatBubbleIntoView();
  };

  useEffect(() => {
    analytics.logEvent(MagiEvent.chatHomeView, { agentId: agentFriendlyId });
  }, [agentFriendlyId, analytics]);

  useEffect(() => {
    setCombinedMessages(
      [...messages]
        .filter(({ timestamp }) => !!timestamp)
        .sort(
          (a, b) => (a.timestamp || 0) - (b.timestamp || 0)
        )
    );

    console.log('combinedMessages', combinedMessages);
    scrollLatestChatBubbleIntoView();
  }, [messages, setCombinedMessages]);

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
                        agentId: agentFriendlyId,
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
                  analytics.logEvent(MagiEvent.bailoutActionClick, {
                    agentId: agentFriendlyId,
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

        <ChatInput
          questionPlaceholder={'question_placeholder'}
          isSubmitting={isLoading}
          data-testid='chat-input'
        />
      </Chat>
    </main>
  );
}

export default function ChatPageWrapper() {
  const [loading, setLoading] = useState(true);
  const { orgFriendlyId, id: agentFriendlyId }: { orgFriendlyId: string, id: string } = useParams();

  useEffect(() => {
    const isInIframe = () => {
      try {
        return window.self !== window.top;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return true;
      }
    };
    if (!isInIframe()) {
      window.location.href = `/demo/${orgFriendlyId}/${agentFriendlyId}`;
    } else {
      setLoading(false);
    }
  }, [orgFriendlyId, agentFriendlyId]);

  if (loading) {
    return null;
  }

  return <ChatPage />;
}
