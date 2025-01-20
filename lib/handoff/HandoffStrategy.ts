import type { Message, HandoffChatMessage } from "@/types";

export interface HandoffStrategy {
  formatMessages: (
    messages: Message[],
    mavenConversationId: string,
  ) => HandoffChatMessage[];
  handleChatEvent: (event: any) => {
    agentName: string | null;
    formattedEvent: any;
  };
  getMessagesEndpoint: string;
  getConversationsEndpoint: string;
}

export interface HandoffContext {
  messages: Message[];
  mavenConversationId: string;
  signedUserData: any;
  headers: HeadersInit;
}
