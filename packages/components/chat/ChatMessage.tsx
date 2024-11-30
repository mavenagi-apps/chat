import React from 'react';
import { ReactMarkdown } from '@magi/components/ReactMarkdown';
import { ChatBubble } from '@magi/components/chat/ChatCard';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import FeedbackForm from '@magi/components/chat/FeedbackForm';
import BailoutFormDisplay from '@magi/components/chat/BailoutFormDisplay';
import { showBotAnswer } from '@/lib/chat/chat-helpers';
import {
  isBotMessage,
  isActionChatMessage,
  type ChatMessage,
  type ActionChatMessage,
  type Message,
  type UserChatMessage,
} from '@/types';
import { type ConversationMessageResponse } from 'mavenagi/api';
import { useTranslations } from 'next-intl';

interface MessageProps {
  message: Message;
  linkTargetInNewTab?: boolean;
  isLastMessage?: boolean;
  latestChatBubbleRef?: React.RefObject<HTMLDivElement>;
  conversationId?: string;
  initialUserChatMessage?: UserChatMessage | null;
  userData?: Record<string, string> | null;
}

export function ChatMessage({
  message,
  linkTargetInNewTab = true,
  isLastMessage = false,
  latestChatBubbleRef,
  conversationId,
}: MessageProps) {
  const t = useTranslations('chat.ChatPage');
  if ('type' in message) {
    switch (message.type) {
      case 'USER':
        return (
          <ChatBubble
            direction='right'
            className='bg-[--brand-color] text-[--brand-text-color]'
            ref={isLastMessage ? latestChatBubbleRef : null}
          >
            <UserMessage
              text={'text' in message ? message.text : ''}
              linkTargetInNewTab={linkTargetInNewTab}
            />
          </ChatBubble>
        );
      case 'ERROR':
        return (
          <ChatBubble
            direction='left'
            className='border-red-500 bg-red-50 text-xs'
            ref={isLastMessage ? latestChatBubbleRef : null}
          >
            <ErrorMessage
              text={'text' in message ? message.text : ''}
              linkTargetInNewTab={linkTargetInNewTab}
            />
          </ChatBubble>
        );
      case 'SIMULATED':
        return (
          <ChatBubble
            direction='left'
            ref={isLastMessage ? latestChatBubbleRef : null}
          >
            <SimulatedMessage
              text={'text' in message ? message.text : ''}
              linkTargetInNewTab={linkTargetInNewTab}
            />
          </ChatBubble>
        );
      default:
        if (isBotMessage(message as Message)) {
          return renderBotMessage(
            message as ConversationMessageResponse.Bot,
            isLastMessage,
            latestChatBubbleRef,
            conversationId,
            linkTargetInNewTab
          );
        }
        return null;
    }
  }
  return null;
}

function UserMessage({
  text,
  linkTargetInNewTab = true,
}: {
  text: string;
  linkTargetInNewTab?: boolean;
}) {
  return (
    <div className='text-xs'>
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function BotMessage({
  message,
  linkTargetInNewTab = true,
}: {
  message: ConversationMessageResponse.Bot;
  linkTargetInNewTab?: boolean;
}) {
  const messageText = message
    .responses
    .filter(r => r.type === 'text')
    .map(({ text }) => text)
    .join('')
    .replaceAll('\\n', '\n');
  return (
    <div className='prose max-w-full overflow-auto text-xs'>
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {messageText}
      </ReactMarkdown>
    </div>
  );
}

function ErrorMessage({
  text,
  linkTargetInNewTab = true,
}: {
  text: string;
  linkTargetInNewTab?: boolean;
}) {
  return (
    <div className='flex items-center'>
      <HiOutlineExclamationCircle className='size-5 text-red-500' />
      <div className='ml-3 flex-1 content-center'>
        <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
          {text !== '' ? text : 'An error occurred. Please try again.'}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function SimulatedMessage({
  text,
  linkTargetInNewTab = true,
}: {
  text: string;
  linkTargetInNewTab?: boolean;
}) {
  return (
    <div className='prose max-w-full text-xs'>
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function renderBotMessage(
  message: ConversationMessageResponse.Bot | ActionChatMessage,
  isLastMessage: boolean,
  latestChatBubbleRef: React.RefObject<HTMLDivElement> | undefined,
  conversationId: string | undefined,
  linkTargetInNewTab: boolean
) {
  if (!showBotAnswer({ message })) {
    return null;
  }
  const showActionForm = isActionChatMessage(message);
  return (
    <ChatBubble
      direction='left'
      ref={isLastMessage ? latestChatBubbleRef : null}
    >
      <BotMessage message={message} linkTargetInNewTab={linkTargetInNewTab} />
      {showActionForm && (
        <BailoutFormDisplay action={message.action} conversationId={conversationId ?? ''} />
      )}
      {!showActionForm && conversationId && (
        <FeedbackForm message={message} conversationId={conversationId} />
      )}
    </ChatBubble>
  );
}
