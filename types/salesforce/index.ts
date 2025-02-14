import { type Message } from "@/types";

// Constants
export const SALESFORCE_CHAT_SUBJECT_HEADER_KEY = "MAVEN-CHAT-SUBJECT";

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

export const SALESFORCE_MESSAGE_TYPES_FOR_HANDOFF_TERMINATION: SalesforceMessageType[] =
  [
    SALESFORCE_MESSAGE_TYPES.ChatRequestFail,
    SALESFORCE_MESSAGE_TYPES.ChatEnded,
  ];

// Message Types
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

export type SalesforceChatRequestFail = SalesforceChatMessage & {
  type: typeof SALESFORCE_MESSAGE_TYPES.ChatRequestFail;
  message: {
    reason: string;
    attachedRecords: string[];
  };
  timestamp?: number;
};

export type SalesforceChatRequestFailUnavailable = SalesforceChatRequestFail & {
  message: {
    reason: "Unavailable";
    attachedRecords: string[];
  };
};

// Response Types
export type ChatSessionResponse = {
  key: string;
  id: string;
  clientPollTimeout: number;
  affinityToken: string;
  message?: string;
  error?: unknown;
};

export type ChatMessageResponse = {
  messages: SalesforceChatMessage[];
  sequence: number;
  offset: number;
};

export type ChatAvailabilityResponse = {
  messages: {
    type: "Availability";
    message: {
      results: { id: string; isAvailable?: boolean }[];
    };
  }[];
};

// User Data Types
export type SalesforceChatUserData = {
  email: string;
  firstName: string;
  lastName: string;
  locationId?: string;
  locationType?: string;
  userId?: string;
};

export type SalesforceRequest = {
  customData?: Record<string, any>;
  email?: string;
  language: string;
  mavenConversationId: string;
  messages: Message[];
  screenResolution: string;
  signedUserData?: string;
  unsignedUserData?: SalesforceChatUserData;
  userAgent: string;
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

// Type Guards
const isChatRequestFail = (
  message: SalesforceChatMessage,
): message is SalesforceChatRequestFail => {
  return message.type === SALESFORCE_MESSAGE_TYPES.ChatRequestFail;
};

export const isChatRequestFailUnavailable = (
  message: SalesforceChatRequestFail,
): message is SalesforceChatRequestFailUnavailable => {
  return isChatRequestFail(message) && message.message.reason === "Unavailable";
};
