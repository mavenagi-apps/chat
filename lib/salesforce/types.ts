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
  messages: Array<{
    type: string;
    message: {
      text?: string;
      name: string;
      schedule?: {
        responseDelayMilliseconds: number;
      };
      agentId: string;
    };
  }>;
  sequence: number;
  offset: number;
};

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

// Define the SalesforceChatMessage type
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
