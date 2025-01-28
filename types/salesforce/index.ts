import { type Message } from "@/types";

export const SALESFORCE_MESSAGE_TYPES = {
  AgentDisconnect: "AgentDisconnect",
  AgentNotTyping: "AgentNotTyping",
  AgentTyping: "AgentTyping",
  ChasitorSessionData: "ChasitorSessionData",
  ChatEnded: "ChatEnded",
  ChatEstablished: "ChatEstablished",
  ChatMessage: "ChatMessage",
  ChatRequestFail: "ChatRequestFail",
  ChatRequestSuccess: "ChatRequestSuccess",
  ChatTransferred: "ChatTransferred",
  CustomEvent: "CustomEvent",
  NewVisitorBreadcrumb: "NewVisitorBreadcrumb",
  QueueUpdate: "QueueUpdate",
  ChatConnecting: "ChatConnecting",
} as const;

export const SALESFORCE_MESSAGE_TYPES_FOR_HANDOFF_TERMINATION = [
  SALESFORCE_MESSAGE_TYPES.ChatRequestFail,
  SALESFORCE_MESSAGE_TYPES.ChatEnded,
];

export type SalesforceMessageType =
  (typeof SALESFORCE_MESSAGE_TYPES)[keyof typeof SALESFORCE_MESSAGE_TYPES];

export type SalesforceChatMessage = {
  type: SalesforceMessageType;
  message: {
    text: string;
    name: string;
    schedule: {
      responseDelayMilliseconds: number;
    };
    agentId: string;
  };
  timestamp?: number;
};

export const isSalesforceMessage = (
  message: any,
): message is SalesforceChatMessage => {
  return message.type in SALESFORCE_MESSAGE_TYPES;
};

export type ChatSessionResponse = {
  key: string;
  id: string;
  clientPollTimeout: number;
  affinityToken: string;
  message?: string;
  error?: unknown;
};

export type ChatVisitorSessionResponse = {
  status: string;
  message?: string;
  error?: unknown;
};

export interface InitiateChatSessionParams {
  data: {
    name: string;
    email: string;
    screenResolution: string;
    userAgent: string;
    subject: string;
  };
}

export interface CreateChatVisitorSessionParams {
  params: {
    name: string;
    email: string;
    screenResolution: string;
    userAgent: string;
    subject: string;
  };
  session: {
    affinityToken: string;
    key: string;
    id: string;
  };
}

export interface GetChatMessagesParams {
  ack: number;
  session: {
    affinityToken: string;
    key: string;
    id?: string;
  };
}

export interface SendChatMessageParams {
  message: string;
  session: {
    affinityToken: string;
    key: string;
    id?: string;
  };
}

export type ChatMessageResponse = {
  messages: SalesforceChatMessage[];
  sequence: number;
  offset: number;
};

export type SalesforceChatUserData = {
  email: string;
  firstName: string;
  lastName: string;
  locationId: string;
  locationType: string;
  question: string;
  screenResolution: string;
  subject: string;
  userAgent: string;
  userId: string;
  language: string;
};

export type SalesforceRequest = {
  unsignedUserData?: SalesforceChatUserData;
  signedUserData?: SalesforceChatUserData;
  messages: Message[];
  mavenConversationId: string;
  email?: string;
  userAgent: string;
  screenResolution: string;
  language: string;
  customData?: Record<string, any>;
};

export type PrechatDetail = {
  label: string;
  value: string | boolean;
  entityMaps: any[];
  displayToAgent: boolean;
  doKnowledgeSearch: boolean;
  transcriptFields: string[];
};

export type EntityFieldMap = {
  fieldName: string;
  label: string;
  doFind: boolean;
  isExactMatch: boolean;
  doCreate: boolean;
};

export const SALESFORCE_CHAT_SUBJECT_HEADER_KEY = "MAVEN-CHAT-SUBJECT";
