import type { HandoffStrategy } from "./HandoffStrategy";
import type { Message, HandoffChatMessage } from "@/types";
import { isChatUserMessage, isBotMessage } from "@/types";
import type { SalesforceChatMessage } from "@/types/salesforce";

export class SalesforceStrategy implements HandoffStrategy {
  getMessagesEndpoint = "/api/salesforce/messages";
  getConversationsEndpoint = "/api/salesforce/conversations";

  formatMessages(
    messages: Message[],
    mavenConversationId: string,
  ): HandoffChatMessage[] {
    return messages
      .filter((message) => ["USER", "bot"].includes(message.type))
      .map((message) => {
        const isBot = isBotMessage(message);
        return {
          author: {
            type: isChatUserMessage(message) ? "user" : "business",
          },
          content: {
            type: "text",
            text: isChatUserMessage(message)
              ? message.text
              : isBot
                ? message.responses
                    .map((response: any) => response.text)
                    .join("")
                : "",
          },
          timestamp: message.timestamp,
          mavenContext: {
            conversationId: mavenConversationId,
            conversationMessageId: isBot
              ? {
                  referenceId: message?.conversationMessageId?.referenceId,
                }
              : undefined,
          },
        };
      });
  }

  handleChatEvent(event: SalesforceChatMessage) {
    let agentName = null;

    if (event.type === "ChatTransferred" && event.message?.name) {
      agentName = event.message.name;
    }

    const formattedEvent = {
      ...event,
      type: "handoff-salesforce",
      timestamp: new Date().getTime(),
    };

    return { agentName, formattedEvent };
  }
}
