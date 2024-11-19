import { type ConversationMessageResponse, type AskStreamActionEvent } from 'mavenagi/api';

type ChatMessage = { text: string; type: 'USER' | 'ERROR' | 'SIMULATED' };
type UserChatMessage = ChatMessage & { type: 'USER' };
type SimulatedChatMessage = ChatMessage & { type: 'SIMULATED' };
type ActionChatMessage = ConversationMessageResponse.Bot & {
  action: AskStreamActionEvent;
};

type Message = (
  | ConversationMessageResponse
  | ActionChatMessage
  | ChatMessage
) & {
  timestamp?: number;
};

const isBotMessage = (
  message: Message
): message is ConversationMessageResponse.Bot => message.type === 'bot';

const isChatMessage = (message: Message): message is ChatMessage =>
  ['USER', 'ERROR', 'SIMULATED'].includes(message.type);

const isChatUserMessage = (message: Message): message is UserChatMessage =>
  message.type === 'USER';

const isActionChatMessage = (message: Message): message is ActionChatMessage =>
  'action' in message && message.type === 'bot';

export {
  isActionChatMessage,
  isBotMessage,
  isChatMessage,
  isChatUserMessage,
  type ActionChatMessage,
  type ChatMessage,
  type Message,
  type SimulatedChatMessage,
  type UserChatMessage,
};
