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

type SalesforceSimulatedChatEstablishedMessage = {
  type: 'ChatEstablished';
  message: {
    text: string;
  };
};

type SalesforceResponseMessage = {
  type:
    | 'ChatMessage'
    | 'QueueUpdate'
    | 'ChatTransferred'
    | 'ChatEnded'
    | 'AgentTyping'
    | 'AgentNotTyping'
    | 'ChatEstablished';
  message: {
    text: string;
    name: string;
    schedule: {
      responseDelayMilliseconds: number;
    };
    agentId: string;
    estimatedWaitTime?: number;
    position?: number;
    reason?: string;
  };
};

type SalesforceSystemMessage = SalesforceResponseMessage | SalesforceSimulatedChatEstablishedMessage;

type SalesforceChatMessage =
  | SalesforceSystemMessage
  | UserChatMessage;

const isChatTransferredMessage = (message: SalesforceChatMessage): message is SalesforceResponseMessage =>
  message.type === 'ChatTransferred';

export {
  isActionChatMessage,
  isBotMessage,
  isChatMessage,
  isChatTransferredMessage,
  isChatUserMessage,
  type ActionChatMessage,
  type ChatMessage,
  type Message,
  type SalesforceChatMessage,
  type SalesforceResponseMessage,
  type SalesforceSimulatedChatEstablishedMessage,
  type SalesforceSystemMessage,
  type SimulatedChatMessage,
  type UserChatMessage,
};
