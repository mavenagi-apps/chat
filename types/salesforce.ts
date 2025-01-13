export type SalesforceMessageType =
  | "AgentDisconnect"
  | "AgentNotTyping"
  | "AgentTyping"
  | "ChasitorSessionData"
  | "ChatEnded"
  | "ChatEstablished"
  | "ChatMessage"
  | "ChatRequestFail"
  | "ChatRequestSuccess"
  | "ChatTransferred"
  | "CustomEvent"
  | "NewVisitorBreadcrumb"
  | "QueueUpdate"
  | "SensitiveDataRules";

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

export type SalesforceEvent = {
  type: SalesforceMessageType;
  agentName: string;
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
  messages: any[];
  mavenConversationId: string;
  email?: string;
  userAgent: string;
  screenResolution: string;
  language: string;
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
