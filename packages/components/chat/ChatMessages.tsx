import { forwardRef, RefObject } from "react";
import type {
  Message,
  IncomingHandoffEvent,
  IncomingHandoffConnectionEvent,
} from "@/types";
import { ChatMessage } from "@magi/components/chat/ChatMessage";
import Spinner from "@magi/components/Spinner";

interface ChatMessagesProps {
  messages: (Message | IncomingHandoffEvent | IncomingHandoffConnectionEvent)[];
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
