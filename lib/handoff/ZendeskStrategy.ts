import type { HandoffStrategy } from "./HandoffStrategy";
import type {
  Message,
  HandoffChatMessage,
  ZendeskWebhookMessage,
} from "@/types";
import { isChatUserMessage, isBotMessage } from "@/types";

export class ZendeskStrategy implements HandoffStrategy {
  messagesEndpoint = "/api/zendesk/messages";
  conversationsEndpoint = "/api/zendesk/conversations";

  formatMessages(
    messages: Message[],
    _mavenConversationId: string,
  ): HandoffChatMessage[] {
    return messages
      .filter((message) => ["USER", "bot"].includes(message.type))
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
}
