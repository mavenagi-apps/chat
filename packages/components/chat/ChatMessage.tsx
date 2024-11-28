import React from 'react';
import { ReactMarkdown } from '@magi/components/ReactMarkdown';
import { ChatBubble } from '@magi/components/chat/ChatCard';
import { HiOutlineExclamationCircle } from 'react-icons/hi2';
import FeedbackForm from '@magi/components/chat/FeedbackForm';
import BailoutFormDisplay from '@magi/components/chat/BailoutFormDisplay';
import EscalationFormDisplay from '@magi/components/chat/EscalationFormDisplay';
import { showBotAnswer } from '@/lib/chat/chat-helpers';
import {
  isBotMessage,
  isActionChatMessage,
  isEscalationChatMessage,
  type ChatMessage,
  type ActionChatMessage,
  type Message,
  type UserChatMessage,
  type HandoffChatMessage,
  type ChatEstablishedMessage,
  type ChatEndedMessage,
} from '@/types';
import { type ConversationMessageResponse } from 'mavenagi/api';
import { useTranslations } from 'next-intl';

export interface MessageProps {
  message: Message | HandoffChatMessage | ChatEstablishedMessage | ChatEndedMessage;
  linkTargetInNewTab?: boolean;
  isLastMessage?: boolean;
  latestChatBubbleRef?: React.RefObject<HTMLDivElement>;
  conversationId?: string;
  initialUserChatMessage?: UserChatMessage | null;
}

function renderHandoffMessage(
  message: HandoffChatMessage,
  isLastMessage: boolean,
  latestChatBubbleRef: React.RefObject<HTMLDivElement> | undefined,
) {
  const author = message.payload.message?.author?.displayName;
  return (
    <ChatBubble
      direction='left-hug'
      author={author}
      ref={isLastMessage ? latestChatBubbleRef : null}
    >
      <ReactMarkdown linkTargetInNewTab={true}>
        {message.payload.message?.content.text || ''}
      </ReactMarkdown>
    </ChatBubble>
  );
}

function renderHandoffEventMessage(
  message: ChatEstablishedMessage | ChatEndedMessage,
  isLastMessage: boolean,
  latestChatBubbleRef: React.RefObject<HTMLDivElement> | undefined,
) {
  const t = useTranslations('chat.Handoff');
  const messageMap = {
    'ChatEstablished': t('connected_to_agent'), 
    'ChatEnded': t('chat_has_ended'),
  };
  const messageText = messageMap[message.type];
  if (!messageText) {
    return null;
  }
  return (
    <div
      ref={isLastMessage ? latestChatBubbleRef : null}
      className='my-5 flex items-center justify-center h-auto text-gray-500'
    >
      <div className='grow border-t border-gray-300'></div>
      <span className='mx-4 prose max-w-full text-xs whitespace-nowrap'>
        {messageText}
      </span>
      <div className='grow border-t border-gray-300'></div>
    </div>
  );
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
      case 'handoff-zendesk':
        return renderHandoffMessage(
          message as HandoffChatMessage,
          isLastMessage,
          latestChatBubbleRef,
        );
      case 'ChatEstablished':
        return renderHandoffEventMessage(message as ChatEstablishedMessage, isLastMessage, latestChatBubbleRef);
      case 'ChatEnded':
        return renderHandoffEventMessage(message as ChatEndedMessage, isLastMessage, latestChatBubbleRef);
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
  const showEscalationForm = isEscalationChatMessage(message);
  return (
    <ChatBubble
      direction='left'
      ref={isLastMessage ? latestChatBubbleRef : null}
    >
      <BotMessage message={message} linkTargetInNewTab={linkTargetInNewTab} />
      {showActionForm && (
        <BailoutFormDisplay action={message.action} conversationId={conversationId ?? ''} />
      )}
      {showEscalationForm && (
        <EscalationFormDisplay />
      )}
      {!showActionForm && !showEscalationForm && conversationId && (
        <FeedbackForm message={message} conversationId={conversationId} />
      )}
    </ChatBubble>
  );
}
