import { forwardRef, RefObject } from 'react';
import { type Message } from '@/types';
import { ChatMessage } from '@magi/components/chat/ChatMessage';
import Spinner from '@magi/components/Spinner';

interface ChatMessagesProps {
  messages: Message[];
  isLoading: boolean;
  isResponseAvailable: boolean;
  conversationId?: string;
  userData: Record<string, string> | null;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  function ChatMessages(
    { messages, isLoading, isResponseAvailable, conversationId, userData },
    ref
  ) {
    return (
      <>
        {messages.map((message, index) => (
          <ChatMessage
            key={index}
            message={message}
            isLastMessage={index === messages.length - 1}
            latestChatBubbleRef={ref as RefObject<HTMLDivElement>}
            conversationId={conversationId}
            userData={userData}
          />
        ))}

        {isLoading && !isResponseAvailable && (
          <div className='my-5'>
            <Spinner color={'#000000'} />
          </div>
        )}
      </>
    );
  }
);

ChatMessages.displayName = 'ChatMessages';
