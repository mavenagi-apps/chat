export namespace Front {
  export type AppChannelBaseMessage = {
    body: string;
    metadata: Metadata;
    subject?: string;
    delivered_at?: number;
    attachments?: AttachmentData[];
  };

  export type AppChannelInboundMessage = AppChannelBaseMessage & {
    sender: Sender;
  };

  export type AppChannelOutboundMessage = AppChannelBaseMessage & {
    to: Sender[];
    sender_name?: string;
  };

  export type Metadata = {
    external_id: string;
    external_conversation_id: string;
  };

  export type Sender = {
    handle: string;
    name?: string;
  };

  export type AttachmentData = {
    buffer: Buffer;
    filename: string;
    content_type: string;
  };

  export type WebhookPayload = {
    type: "message" | "message_imported" | string;
    payload: WebhookMessage;
    metadata: {
      external_conversation_id?: string;
      external_conversation_ids: string[];
    };
  };

  export type WebhookMessage = {
    _links: {
      self: string;
      related: {
        conversation: string;
        message_seen: string;
        message_replied_to?: string;
      };
    };
    id: string;
    type: string;
    is_inbound: boolean;
    created_at: number;
    blurb: string;
    body: string;
    text: string;
    error_type: string | null;
    version: string;
    subject: string;
    draft_mode: string;
    metadata: {
      headers: {
        in_reply_to: string | null;
      };
    };
    author: Author;
    recipients: Recipient[];
    attachments: any[];
    signature: string | null;
    is_draft: boolean;
  };

  export type Author = {
    _links: {
      self: string;
      related: {
        inboxes: string;
        conversations: string;
      };
    };
    id: string;
    email: string;
    username: string;
    first_name: string;
    last_name: string;
    is_admin: boolean;
    is_available: boolean;
    is_blocked: boolean;
    // custom_fields: CustomFields;
  };

  export type Recipient = {
    _links: {
      related: {
        contact: string | null;
      };
    };
    name: string | null;
    handle: string;
    role: "from" | "to";
  };
}
