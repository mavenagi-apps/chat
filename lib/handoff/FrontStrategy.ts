import {
  type HandoffStrategy,
  MESSAGE_TYPES_FOR_HANDOFF_CREATION,
} from "./HandoffStrategy";
import type { Message, HandoffChatMessage } from "@/types";
import type { Front } from "@/types/front";
import { isChatUserMessage, isBotMessage } from "@/types";

export class FrontStrategy implements HandoffStrategy {
  messagesEndpoint = "/api/front/messages";
  conversationsEndpoint = "/api/front/conversations";

  formatMessages(
    messages: Message[],
    mavenConversationId: string,
  ): HandoffChatMessage[] {
    return messages
      .filter((message) =>
        MESSAGE_TYPES_FOR_HANDOFF_CREATION.includes(message.type),
      )
      .map((message: any) => ({
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
        timestamp: message.timestamp,
        mavenContext: {
          conversationId: mavenConversationId,
          conversationMessageId: {
            referenceId: message?.conversationMessageId?.referenceId,
          },
        },
      }));
  }

  handleChatEvent(event: Front.WebhookMessage) {
    const isAutoReply = event.type === "message_autoreply";
    const agentName = isAutoReply
      ? undefined
      : `${event.author.first_name} ${event.author.last_name}`.trim();

    const formattedEvent = {
      ...event,
      type: isAutoReply ? "front-agent" : "front-autoreply",
      timestamp: Math.trunc(event.created_at * 1000),
    };

    return { agentName, formattedEvent };
  }
}
