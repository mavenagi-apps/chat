'use client';

/* eslint-disable i18next/no-literal-string */
/* eslint-disable react/jsx-curly-brace-presence */

import * as React from 'react';
import { useState, useEffect } from 'react';
import { HiArrowNarrowRight } from 'react-icons/hi';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import { useTranslations } from 'next-intl';

import Chat from '@magi/components/chat/Chat';
import { BotMessage, UserMessage } from '@magi/components/chat/ChatMessage';
import { ChatBubble } from '@magi/components/chat/ChatCard';
import { ChatInput } from '@magi/components/chat/ChatInput';
import { useChat } from '@magi/components/chat/use-chat';
import { ReactMarkdown } from '@magi/components/ReactMarkdown';
import Spinner from '@magi/components/Spinner';
import { Logo } from '@magi/components/Logo';
import { TextAnchor } from '@magi/ui';
import { getSources, showBotAnswer } from '@/lib/chat/chat-helpers';

import { type ChatMessage } from '@magi/components/chat/Chat';

interface Props {
  params: {
    orgFriendlyId: string; // Organization ID
    id: string; // Agent ID
  };
}

export default function ChatPage({ params }: Props) {
  const [isIdle, setIsIdle] = useState(false);
  const [idleMessageDisplayed, setIdleMessageDisplayed] = useState(false);

  const t = useTranslations('chat.ChatPage');
  const { messages, setMessages, isLoading, isResponseAvailable, askQuestion } =
    useChat({
      ...params,
    });

  const ask = async (question: string) => {
    // analytics.logEvent(MagiEvent.chatAskClick, {agentId: agent.id, ticketId: ticketId || ''})
    askQuestion({
      text: question,
      type: 'USER',
    });
    setTimeout(
      () =>
        latestQuestionRef.current?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
          inline: 'nearest',
        }),
      0
    );
  };

  const latestQuestionRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout;

    const resetTimer = () => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        setIsIdle(true);
      }, 30000); // 30 seconds
    };

    const handleUserActivity = () => {
      setIsIdle(false);
      resetTimer();
    };

    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keypress', handleUserActivity);

    resetTimer();

    return () => {
      clearTimeout(timer);
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keypress', handleUserActivity);
    };
  }, []);

  useEffect(() => {
    if (isIdle && !idleMessageDisplayed) {
      const idleMessage: ChatMessage = {
        text: 'Thank you for reaching out. Can you please fill out this [survey](https://tripadvisor.co1.qualtrics.com/jfe/form/SV_08van6GAWPvXtyd?chatKey=insertTicketId) to tell us about your experience? [(https://tripadvisor.co1.qualtrics.com/jfe/form/SV_08van6GAWPvXtyd?chatKey=insertTicketId)](https://tripadvisor.co1.qualtrics.com/jfe/form/SV_08van6GAWPvXtyd?chatKey=insertTicketId)',
        type: 'ERROR',
      };
      setMessages([...messages, idleMessage]);
      setIdleMessageDisplayed(true);
    }
  }, [
    isIdle,
    setMessages,
    messages,
    setIdleMessageDisplayed,
    idleMessageDisplayed,
  ]);

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      <div className="border-b border-gray-300 bg-white md:block">
        <div className="text-md flex p-5 font-medium text-gray-950">
          {/* TODO(doll): Many of our customer images are SVGs which NextJs doesn't support well by default */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {/* <img alt="Logo" src={agentImage(agent.id, AgentFields.LOGO)} className="h-7" /> */}
        </div>
      </div>

      <Chat brandColor="#000000" messages={messages} askFn={ask}>
        <div className="flex flex-1 flex-col overflow-auto text-xs">
          <div className="mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5">
            <ChatBubble direction="full">
              <div className="flex flex-col">
                <div className="mb-2 whitespace-pre-wrap">
                  <ReactMarkdown linkTargetInNewTab>
                    {t('default_welcome_message')}
                  </ReactMarkdown>
                </div>
                {/* {agent.popularQuestions.slice(0, 3).map((question, index) => (
                   <div className="my-1 cursor-pointer underline" key={index} onClick={() => ask(question)}>
                     {question}
                   </div>
                 ))} */}
              </div>
            </ChatBubble>

            {messages.map((value, index) =>
              value.type === 'HUMAN_AGENT' || value.type === 'USER' ? (
                <ChatBubble
                  direction="right"
                  className="bg-[--brand-color] text-white"
                  key={index}
                  ref={index === messages.length - 1 ? latestQuestionRef : null}
                >
                  <UserMessage text={value.text} linkTargetInNewTab />
                </ChatBubble>
              ) : value.type === 'ERROR' ? (
                <ChatBubble
                  direction="left"
                  className="border-red-500 bg-red-50 text-xs"
                  key={index}
                >
                  <div className="flex items-center">
                    <div>
                      <HiOutlineExclamationCircle className="size-5 text-red-500" />
                    </div>
                    <div className="ml-3 flex-1 content-center">
                      {value.text !== ''
                        ? value.text
                        : // : t("default_error_message")}
                          'Default error message goes here'}
                    </div>
                  </div>
                </ChatBubble>
              ) : (
                <ChatBubble direction="left" key={index}>
                  {showBotAnswer({ message: value }) ? (
                    <div className="max-w-full">
                      <BotMessage message={value} linkTargetInNewTab />
                    </div>
                  ) : (
                    <div className="prose max-w-full text-xs">
                      {/* <BailoutFormDisplay
                         agent={agent}
                         message={value.text}
                         ticketId={value.ticketId}
                         ticketMessageId={value.id}
                         showForm={index === messages.length - 1}
                       /> */}
                    </div>
                  )}

                  {getSources({ message: value }).length > 0 && (
                    <div className="flex flex-col">
                      <div className="text-gray-500">
                        {/* {t("related_links")} */}
                        Related links goes here
                      </div>
                      <ul className="mt-2 space-y-2">
                        {getSources({ message: value }).map((source, index) => (
                          <li
                            key={index}
                            className="flex items-center space-x-3"
                          >
                            <HiArrowNarrowRight className="h-3.5 w-3.5" />
                            <span className="flex-1">
                              <TextAnchor
                                key={index}
                                href={source.url}
                                target="_blank"
                              >
                                {source.title || source.url}
                              </TextAnchor>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* <FeedbackForm
                     message={value}
                     showBailoutButton={showBotAnswer({message: value}) && index === messages.length - 1}
                     bailoutAgent={agent}
                   /> */}
                </ChatBubble>
              )
            )}
            {isLoading && !isResponseAvailable && (
              <div className="my-5">
                <Spinner color={'#000000'} />
              </div>
            )}
          </div>
          {messages.length === 0 && !isLoading && (
            <div className="flex h-20 w-full items-center text-center">
              <div className="mx-auto flex items-center text-xs text-gray-400">
                {/* {t("powered_by")}{" "} */}
                Powered by text goes here{' '}
                <a href="https://www.mavenagi.com" target="_blank">
                  <Logo className="ml-1 h-6" width={82} height={24} />
                </a>
              </div>
            </div>
          )}
        </div>
        <ChatInput
          questionPlaceholder="Ask a question..."
          isSubmitting={isLoading}
          data-testid="chat-input"
        />
      </Chat>
    </main>
  );
}
