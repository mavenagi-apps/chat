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
import type { ZendeskAgentAvailabilityResponse } from "@/src/types/zendesk";
export class ZendeskStrategy implements HandoffStrategy {
  messagesEndpoint = "/api/zendesk/messages";
  conversationsEndpoint = "/api/zendesk/conversations";

  constructor(private readonly configuration: ClientSafeHandoffConfig) {}

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
}

export class ZendeskServerStrategy implements ServerHandoffStrategy {
  constructor(private configuration: ZendeskHandoffConfiguration) {}

  isLiveHandoffAvailable = async () => {
    return this.fetchHandoffAvailability();
  };

  fetchHandoffAvailability = async () => {
    try {
      if (
        !this.configuration.enableAvailabilityCheck ||
        !this.configuration.availabilityCheckApiEmail ||
        !this.configuration.availabilityCheckApiToken
      ) {
        return true;
      }

      const url =
        `https://${this.configuration.subdomain}.zendesk.com` +
        "/api/v2/agent_availabilities" +
        "?filter[channel_status]=messaging:online" +
        "&select_channel=messaging";
      const encodedApiKey = Buffer.from(
        `${this.configuration.availabilityCheckApiEmail}/token:${this.configuration.availabilityCheckApiToken}`,
      ).toString("base64");
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Basic ${encodedApiKey}`,
        },
      });
      if (!response.ok) {
        return true;
      }

      const { data } =
        (await response.json()) as ZendeskAgentAvailabilityResponse;
      const available = data && data.length > 0;
      return available;
    } catch (error) {
      console.error("Error fetching handoff availability:", error);
      return true;
    }
  };
}
