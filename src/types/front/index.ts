// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Front {
  export type PagedResource = object;

  export type AppChannelSyncResponse = {
    status: string;
    message_uid: string;
  };

  export type ImportMessageResponse = AppChannelSyncResponse;

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
    _links: Links;
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
  } & { timestamp?: number }; // this is not part of the webhook message, but is used in the app

  export type Author = {
    _links: Links;
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
    _links: Omit<Links, "self">;
    name: string | null;
    handle: string;
    role: "from" | "to";
  };

  export type Links = {
    self: string;
    related: {
      channels?: string;
      comments?: string;
      conversation?: string;
      conversations?: string;
      contact?: string;
      events?: string;
      followers?: string;
      inboxes?: string;
      messages?: string;
      message_replied_to?: string;
      mentions?: string;
      teammates?: string;
    };
  };

  export type Channel = PagedResource & {
    _links: Links;
    address: string;
    id: string;
    name: string;
    send_as: string;
    settings?: ChannelSettings;
    type: string;
  };

  export type ChannelSettings = {
    webhook_url: string;
  };

  export type Inbox = PagedResource & {
    _links: Links;
    address: string;
    id: string;
    name: string;
    send_as: string;
    type: string;
  };

  interface Range {
    start: string;
    end: string;
  }

  export type ShiftDays = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

  export type Shift = PagedResource & {
    _links: {
      self: string;
      related: {
        teammates: string;
        owner: string;
      };
    };
    id: string;
    name: string;
    color: string;
    timezone: string;
    times: {
      [key in ShiftDays]?: Range;
    };
    created_at: number;
    updated_at: number;
  };

  export type Teammate = PagedResource & {
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
    type: string;
  };

  export type Pagination = {
    limit: number;
    next: string | null;
    prev?: string;
  };
  export type List<T extends PagedResource> = {
    _pagination: Pagination;
    _links: Omit<Links, "related">;
    _results: T[];
  };

  export type PagedEndpointParams = {
    next?: string | null;
    limit?: number;
  };

  export type ImportedMessage = {
    sender: {
      author_id?: string;
      handle: string;
      name?: string;
    };
    body_format?: "html" | "markdown";
    type?: "email";
    metadata: {
      thread_ref?: string;
      is_inbound: boolean;
      should_skip_rules?: boolean;
      is_archived?: boolean;
    };
    assignee_id?: string;
    attachments?: string[];
    to: string[];
    tags?: string[];
    cc?: string[];
    bcc?: string[];
    subject?: string;
    body: string;
    external_id: string;
    created_at: number;
    conversation_id?: string;
  };

  export type Contact = {
    _links: {
      self: string;
      related: {
        notes?: string;
        conversations?: string;
        owner?: string;
      };
    };
    id: string;
    name: string;
    description: string;
    avatar_url: string;
    is_spammer: boolean;
    links: string[];
    groups: ContactGroup[];
    handles: Handle[];
    custom_fields: Record<string, unknown>;
    is_private: boolean;
  };

  export type ContactUpdate = {
    name?: string;
    description?: string;
    // NOTE: not supported
    // avatar?: string;
    is_spammer?: boolean;
    links?: string[];
    group_names?: string[];
    custom_fields?: Record<string, unknown>;
  };

  export type ContactGroup = {
    _links: {
      self: string;
      related: {
        contacts: string;
        owner: string;
      };
    };
    id: string;
    name: string;
    is_private: boolean;
  };

  export type Handle = {
    handle: string;
    source: string;
  };
}
