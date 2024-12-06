import { type Message, isActionChatMessage, isBotMessage } from "@/types";

export function showBotAnswer({ message }: { message: Message }) {
  return (
    isActionChatMessage(message) ||
    (isBotMessage(message) && message.responses.length > 0)
  );
}
