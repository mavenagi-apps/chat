export type FrontAppChannelBaseMessage = {
  body: string;
  metadata: FrontMetadata;
  subject: string;
  delivered_at: number;
  attachments: string[];
};

export type FrontAppChannelInboundMessage = FrontAppChannelBaseMessage & {
  sender: FrontSender;
};

export type FrontAppChannelOutboundMessage = FrontAppChannelBaseMessage & {
  to: FrontSender[];
  sender_name: string;
};

export interface FrontMetadata {
  external_id: string;
  external_conversation_id: string;
}

export interface FrontSender {
  handle: string;
  name: string;
}
