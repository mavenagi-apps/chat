import { forwardRef, useContext } from "react";
import type {
  Message,
  IncomingHandoffEvent,
  IncomingHandoffConnectionEvent,
} from "@/types";
import { ChatMessage } from "@magi/components/chat/ChatMessage";
import Spinner from "@magi/components/Spinner";
import { ChatContext } from "./Chat";

interface ChatMessagesProps {
  isLoading: boolean;
  isResponseAvailable: boolean;
  mavenUserId: string | null;
}

export const ChatMessages = forwardRef<HTMLDivElement, ChatMessagesProps>(
  function ChatMessages({ isLoading, isResponseAvailable, mavenUserId }, _ref) {
    const { messages, conversationId } = useContext(ChatContext);
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
