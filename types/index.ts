import {
  type ConversationMessageResponse,
  type AskStreamActionEvent,
  type Attachment,
} from "mavenagi/api";

import type { ZendeskWebhookMessage } from "@/types/zendesk";
import type { Front } from "./front";
import type { SalesforceChatMessage } from "./salesforce";
import { SALESFORCE_MESSAGE_TYPES } from "./salesforce";

type IncomingHandoffEvent =
  | SalesforceChatMessage
  | ZendeskWebhookMessage
  | Front.WebhookMessage;

interface VerifiedUserData {
  firstName: string;
  lastName: string;
  email: string;
  [key: string]: any;
}

type ChatMessage = {
  text: string;
  type: "USER" | "ERROR" | "SIMULATED";
  timestamp?: number;
};
type UserChatMessage = ChatMessage & {
  type: "USER";
  attachments?: Attachment[];
};
type ActionChatMessage = ConversationMessageResponse.Bot & {
  action: AskStreamActionEvent;
};

type EscalationChatMessage = ConversationMessageResponse.Bot & {
  action: AskStreamActionEvent & { formLabel: "escalate-live-agent" };
};

type ChatEstablishedMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.ChatEstablished;
  timestamp: number;
};

type ChatEndedMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.ChatEnded;
  timestamp: number;
};

type ChatConnectingMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.ChatConnecting;
  timestamp: number;
};

type ChatTransferredMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.ChatTransferred;
  message: {
    name: string;
    userId: string;
    sneakPeakEnabled: boolean;
    isTransferToBot: boolean;
    chasitorIdleTimeout: {
      isEnabled: boolean;
      warningTime: number;
      timeout: number;
    };
  };
  timestamp: number;
};

type QueueUpdateMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.QueueUpdate;
  timestamp: number;
  message: {
    estimatedWaitTime: number;
    position: number;
  };
};

type AgentTypingMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.AgentTyping;
  timestamp: number;
  message: {
    name: string;
    agentId: string;
  };
};

type AgentNotTypingMessage = {
  type: typeof SALESFORCE_MESSAGE_TYPES.AgentNotTyping;
  timestamp: number;
  message: {
    name: string;
    agentId: string;
  };
};

type IncomingHandoffConnectionEvent =
  | ChatEstablishedMessage
  | ChatEndedMessage
  | ChatConnectingMessage
  | ChatTransferredMessage
  | QueueUpdateMessage
  | AgentTypingMessage
  | AgentNotTypingMessage;

type Message = (
  | ConversationMessageResponse
  | ActionChatMessage
  | ChatMessage
) & {
  timestamp?: number;
};

type CombinedMessage =
  | Message
  | IncomingHandoffConnectionEvent
  | IncomingHandoffEvent;

type ZendeskChatMessage = {
  id?: string;
  type: string;
  message?: {
    text: string;
    name?: string;
    agentId?: string;
  };
  event_name?: string;
  event_timestamp?: string;
};

type HandoffChatMessage = {
  author: {
    type: "user" | "business";
  };
  content: {
    type: "text";
    text: string;
  };
  timestamp?: number;
  mavenContext?: {
    conversationId: string;
    conversationMessageId?: {
      referenceId?: string;
    };
  };
};

const isBotMessage = (
  message: Message | IncomingHandoffConnectionEvent | IncomingHandoffEvent,
): message is ConversationMessageResponse.Bot =>
  "type" in message && message.type === "bot";

const isChatMessage = (message: Message): message is ChatMessage =>
  ["USER", "ERROR", "SIMULATED"].includes(message.type);

const isChatUserMessage = (message: Message): message is UserChatMessage =>
  message.type === "USER";

const isEscalationChatMessage = (
  message: Message,
): message is EscalationChatMessage =>
  "action" in message &&
  message.type === "bot" &&
  !isActionChatMessage(message);

const isActionChatMessage = (message: Message): message is ActionChatMessage =>
  "action" in message &&
  message.type === "bot" &&
  message.action.formLabel !== "escalate-live-agent";

export {
  isActionChatMessage,
  isBotMessage,
  isChatMessage,
  isChatUserMessage,
  isEscalationChatMessage,
  type ActionChatMessage,
  type ChatMessage,
  type Message,
  type UserChatMessage,
  type ZendeskWebhookMessage,
  type ChatEstablishedMessage,
  type ChatEndedMessage,
  type ZendeskChatMessage,
  type VerifiedUserData,
  type HandoffChatMessage,
  type SalesforceChatMessage,
  type IncomingHandoffEvent,
  type IncomingHandoffConnectionEvent,
  type QueueUpdateMessage,
  type CombinedMessage,
};
