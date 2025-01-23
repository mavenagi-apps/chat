import { useContext } from "react";
import { ChatMessage } from "@magi/components/chat/ChatMessage";
import Spinner from "@magi/components/Spinner";
import { ChatContext } from "./Chat";

interface ChatMessagesProps {
  isLoading: boolean;
  isResponseAvailable: boolean;
  mavenUserId: string | null;
}

export const ChatMessages = ({
  isLoading,
  isResponseAvailable,
  mavenUserId,
}: ChatMessagesProps) => {
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
};
