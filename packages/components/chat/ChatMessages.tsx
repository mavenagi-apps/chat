import { forwardRef, RefObject } from "react";
import type {
  Message,
  ZendeskWebhookMessage,
  ChatEstablishedMessage,
  ChatEndedMessage,
} from "@/types";
import { ChatMessage } from "@magi/components/chat/ChatMessage";
import Spinner from "@magi/components/Spinner";
import type { Front } from "@/types/front";

interface ChatMessagesProps {
  messages: (
    | Message
    | ZendeskWebhookMessage
    | Front.WebhookMessage
    | ChatEstablishedMessage
    | ChatEndedMessage
  )[];
  isLoading: boolean;
  isResponseAvailable: boolean;
  conversationId?: string;
  mavenUserId: string | null;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  function ChatMessages(
    { messages, isLoading, isResponseAvailable, conversationId, mavenUserId },
    ref,
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
            mavenUserId={mavenUserId}
          />
        ))}

        {isLoading && !isResponseAvailable && (
          <div className="my-5">
            <Spinner color={"#000000"} />
          </div>
        )}
      </>
    );
  },
);

ChatMessages.displayName = "ChatMessages";
