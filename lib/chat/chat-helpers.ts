import { type Source } from 'mavenagi/api';
import { type Message, isActionChatMessage, isBotMessage } from '@/types'

export function showBotAnswer({
  message,
}: {
  message: Message;
}) {
  return (
    isActionChatMessage(message) ||
    (isBotMessage(message) && message.responses.length > 0)
  );
}

export function showActionForm({
  message,
}: {
  message: Message;
}) {
  return isActionChatMessage(message);
}

export function getFollowUpQuestions({message, count = 3}: {message: Message; count?: number}): string[] {
  return isBotMessage(message)
    ? message?.metadata?.followupQuestions?.slice(0, count) || []
    : [];
}

export function getSources({message}: {message: Message }): Source[] {
  return isBotMessage(message)
    ? message?.metadata?.sources?.slice(0, 3) || []
    : [];
}
