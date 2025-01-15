import type { HandoffStrategy } from "./HandoffStrategy";
import type {
  IncomingHandoffConnectionEvent,
  IncomingHandoffEvent,
  Message,
  UserChatMessage,
} from "@/types";
import type { SalesforceChatMessage } from "@/types/salesforce";
import {
  isSalesforceMessage,
  SALESFORCE_CHAT_SUBJECT_HEADER_KEY,
} from "@/types/salesforce";

export class SalesforceStrategy implements HandoffStrategy<Message> {
  readonly messagesEndpoint = "/api/salesforce/messages";
  readonly conversationsEndpoint = "/api/salesforce/conversations";
  readonly subjectHeaderKey = SALESFORCE_CHAT_SUBJECT_HEADER_KEY;
  readonly connectedToAgentMessageType = "ChatConnecting";

  formatMessages(messages: Message[], _mavenConversationId: string): Message[] {
    return messages.filter((message) => ["USER", "bot"].includes(message.type));
  }

  handleChatEvent(event: SalesforceChatMessage): {
    agentName: string | null;
    formattedEvent: SalesforceChatMessage;
  } {
    console.log("handleChatEvent", event);
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
    console.log("showAgentTypingIndicator", messages);
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

  shouldSupressHandoffInputDisplay(agentName: string): boolean {
    return !agentName;
  }
}
