import {
  type HandoffStrategy,
  MESSAGE_TYPES_FOR_HANDOFF_CREATION,
  type ServerHandoffStrategy,
} from "./HandoffStrategy";
import type {
  IncomingHandoffConnectionEvent,
  IncomingHandoffEvent,
  Message,
  UserChatMessage,
} from "@/types";
import type { SalesforceChatMessage } from "@/types/salesforce";
import { SALESFORCE_CHAT_SUBJECT_HEADER_KEY } from "@/types/salesforce";

export class SalesforceStrategy implements HandoffStrategy<Message> {
  readonly messagesEndpoint = "/api/salesforce/messages";
  readonly conversationsEndpoint = "/api/salesforce/conversations";
  readonly subjectHeaderKey = SALESFORCE_CHAT_SUBJECT_HEADER_KEY;
  readonly connectedToAgentMessageType = "ChatConnecting";

  formatMessages(messages: Message[], _mavenConversationId: string): Message[] {
    return messages.filter((message) =>
      MESSAGE_TYPES_FOR_HANDOFF_CREATION.includes(message.type),
    );
  }

  handleChatEvent(event: SalesforceChatMessage): {
    agentName: string | null;
    formattedEvent: SalesforceChatMessage;
  } {
    let agentName = null;

    if (event.type === "ChatTransferred" && event.message?.name) {
      agentName = event.message.name;
    }

    const formattedEvent = {
      ...event,
      type: event.type,
      timestamp: new Date().getTime(),
    } as SalesforceChatMessage;

    return { agentName, formattedEvent };
  }

  showAgentTypingIndicator(
    messages: (
      | UserChatMessage
      | IncomingHandoffEvent
      | IncomingHandoffConnectionEvent
    )[],
  ): boolean {
    const lastMessage = messages[messages.length - 1];
    const lastMessageTimestamp =
      "timestamp" in lastMessage ? lastMessage.timestamp : 0;
    const currentTimestamp = new Date().getTime();
    const timeSinceLastMessage = currentTimestamp - (lastMessageTimestamp ?? 0);
    if (timeSinceLastMessage > 3000) {
      return false;
    }

    if (["AgentTyping", "AgentNotTyping"].includes(lastMessage?.type ?? "")) {
      return lastMessage.type === "AgentTyping";
    }

    return false;
  }

  shouldSupressHandoffInputDisplay(agentName: string | null): boolean {
    return !agentName;
  }
}

export class SalesforceServerStrategy implements ServerHandoffStrategy {
  constructor(private configuration: SalesforceHandoffConfiguration) {}
  isLiveHandoffAvailable? = () => Promise.resolve(true);
}
