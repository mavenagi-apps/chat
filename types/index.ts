import {
  type ConversationMessageResponse,
  type AskStreamActionEvent,
} from "mavenagi/api";

import type { HandoffChatMessage } from "@/types/zendesk";

type ChatMessage = {
  text: string;
  type: "USER" | "ERROR" | "SIMULATED";
  timestamp?: number;
};
type UserChatMessage = ChatMessage & { type: "USER" };
type ActionChatMessage = ConversationMessageResponse.Bot & {
  action: AskStreamActionEvent;
};

type EscalationChatMessage = ConversationMessageResponse.Bot & {
  action: AskStreamActionEvent & { formLabel: "escalate-live-agent" };
};

type ChatEstablishedMessage = {
  type: "ChatEstablished";
  timestamp: number;
};

type ChatEndedMessage = {
  type: "ChatEnded";
  timestamp: number;
};

type Message = (
  | ConversationMessageResponse
  | ActionChatMessage
  | ChatMessage
) & {
  timestamp?: number;
};

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

const isBotMessage = (
  message:
    | Message
    | HandoffChatMessage
    | ChatEstablishedMessage
    | ChatEndedMessage,
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
  type HandoffChatMessage,
  type ChatEstablishedMessage,
  type ChatEndedMessage,
  type ZendeskChatMessage,
};
