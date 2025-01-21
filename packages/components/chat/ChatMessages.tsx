import { forwardRef, RefObject } from "react";

import { CombinedMessage } from "@/types";
import { ChatMessage } from "@magi/components/chat/ChatMessage";
import Spinner from "@magi/components/Spinner";
interface ChatMessagesProps {
  messages: CombinedMessage[];
  isLoading: boolean;
  isResponseAvailable: boolean;
  conversationId?: string;
  mavenUserId: string | null;
}

export function ChatMessages({
  messages,
  isLoading,
  isResponseAvailable,
  conversationId,
  mavenUserId,
}: ChatMessagesProps) {
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
}
