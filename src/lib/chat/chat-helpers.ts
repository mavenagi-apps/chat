import { type Message, isActionChatMessage, isBotMessage } from "@/src/types";

export function showBotAnswer({ message }: { message: Message }) {
  return (
    isActionChatMessage(message) ||
    (isBotMessage(message) && message.responses.length > 0)
  );
}
