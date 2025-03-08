export type ZendeskWebhookMessage = {
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
  event: ZendeskWebhookMessage;
};

export type ZendeskAgentAvailabilityResponse = {
  links: Record<string, unknown>;
  data: {
    type: string;
    id: string;
    attributes: {
      agent_id: number;
      version: number;
      group_ids: number[];
      skills: string[];
    };
    links: Record<string, unknown>;
    relationships: Record<string, unknown>;
  }[];
  included: {
    type: string;
    id: string;
    attributes: {
      name: string;
      status: string;
      updated_at: string;
      work_item_count: number;
    };
  }[];
  meta: {
    has_more: boolean;
  };
};
