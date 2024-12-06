export type HandoffChatMessage = {
  timestamp?: number;
  createdAt: string;
  id: string;
  type?: string;
  payload: {
    conversation?: {
      id: string;
      type: "personal";
      activeSwitchboardIntegration?: Record<string, unknown>;
    };
    message?: {
      id: string;
      author: {
        type: "user" | "business";
        avatarUrl?: string;
        displayName?: string;
      };
      content: {
        type: "text";
        text: string;
      };
      metadata?: Record<string, unknown>;
      received: string;
      source?: Record<string, unknown>;
    };
    type: "conversation:message";
  };
};

export type ZendeskMessagePayload = {
  webhookId: string;
  event: HandoffChatMessage;
};
