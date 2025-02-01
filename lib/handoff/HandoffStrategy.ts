import type {
  Message,
  HandoffChatMessage,
  IncomingHandoffConnectionEvent,
  IncomingHandoffEvent,
  UserChatMessage,
} from "@/types";

export const MESSAGE_TYPES_FOR_HANDOFF_CREATION = ["USER", "bot"];

export interface HandoffStrategy<T = HandoffChatMessage> {
  formatMessages: (messages: Message[], mavenConversationId: string) => T[];
  handleChatEvent: (event: any) => {
    agentName?: string | null;
    formattedEvent?: any;
    shouldEndHandoff?: boolean;
  };
  showAgentTypingIndicator?: (
    messages: (
      | UserChatMessage
      | IncomingHandoffEvent
      | IncomingHandoffConnectionEvent
    )[],
  ) => boolean;
  messagesEndpoint: string;
  conversationsEndpoint: string;
  connectedToAgentMessageType?: string;
  subjectHeaderKey?: string;
  shouldSupressHandoffInputDisplay?: (agentName: string | null) => boolean;
}

export interface ServerHandoffStrategy {
  isLiveHandoffAvailable?: () => Promise<boolean>;
  fetchHandoffAvailability?: () => Promise<boolean>;
}

export interface HandoffContext {
  messages: Message[];
  mavenConversationId: string;
  signedUserData: any;
  headers: HeadersInit;
}
