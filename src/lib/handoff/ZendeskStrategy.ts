import {
  type HandoffStrategy,
  MESSAGE_TYPES_FOR_HANDOFF_CREATION,
  type ServerHandoffStrategy,
} from "./HandoffStrategy";
import type {
  Message,
  HandoffChatMessage,
  ZendeskWebhookMessage,
} from "@/src/types";
import { isChatUserMessage, isBotMessage } from "@/src/types";

export class ZendeskStrategy implements HandoffStrategy {
  messagesEndpoint = "/api/zendesk/messages";
  conversationsEndpoint = "/api/zendesk/conversations";

  constructor(private readonly configuration: ZendeskHandoffConfiguration) {}

  formatMessages(
    messages: Message[],
    _mavenConversationId: string,
  ): HandoffChatMessage[] {
    return messages
      .filter((message) =>
        MESSAGE_TYPES_FOR_HANDOFF_CREATION.includes(message.type),
      )
      .map((message) => ({
        author: {
          type: isChatUserMessage(message) ? "user" : "business",
        },
        content: {
          type: "text",
          text: isChatUserMessage(message)
            ? message.text
            : isBotMessage(message)
              ? message.responses.map((response: any) => response.text).join("")
              : "",
        },
      }));
  }

  handleChatEvent(event: ZendeskWebhookMessage) {
    const payload = event.payload;
    const author = payload?.message?.author;
    let agentName = null;

    if (author?.type === "user") {
      return { agentName: null, formattedEvent: null };
    }

    if (author?.type === "business" && author.displayName) {
      agentName = author.displayName;
    }

    const formattedEvent = {
      ...event,
      type: "handoff-zendesk",
      timestamp: new Date(event.createdAt).getTime(),
    };

    return { agentName, formattedEvent };
  }

  isLiveHandoffAvailable? = () => Promise.resolve(true);
}

export class ZendeskServerStrategy implements ServerHandoffStrategy {
  constructor(private configuration: ZendeskHandoffConfiguration) {}
  isLiveHandoffAvailable? = () => Promise.resolve(true);
  fetchHandoffAvailability? = () => Promise.resolve(true);
}
