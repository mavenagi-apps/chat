import { SALESFORCE_API_VERSION } from "@/src/app/constants/handoff";
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
} from "@/src/types";
import {
  type SalesforceChatMessage,
  type SalesforceChatRequestFail,
  isChatRequestFailUnavailable,
} from "@/src/types/salesforce";
import {
  SALESFORCE_CHAT_SUBJECT_HEADER_KEY,
  SALESFORCE_MESSAGE_TYPES,
  SALESFORCE_MESSAGE_TYPES_FOR_HANDOFF_TERMINATION,
  type ChatAvailabilityResponse,
} from "@/src/types/salesforce";
export class SalesforceStrategy implements HandoffStrategy<Message> {
  readonly messagesEndpoint = "/api/salesforce/messages";
  readonly conversationsEndpoint = "/api/salesforce/conversations";
  readonly subjectHeaderKey = SALESFORCE_CHAT_SUBJECT_HEADER_KEY;
  readonly connectedToAgentMessageType =
    SALESFORCE_MESSAGE_TYPES.ChatConnecting;

  constructor(private readonly configuration: SalesforceHandoffConfiguration) {}

  private shouldEndHandoff(event: SalesforceChatMessage): boolean {
    const shouldEndByType =
      SALESFORCE_MESSAGE_TYPES_FOR_HANDOFF_TERMINATION.includes(event.type);

    // Check if message text matches terminating text
    const handoffConfig = this.configuration as SalesforceHandoffConfiguration;
    const terminatingText = handoffConfig?.handoffTerminatingMessageText;
    const shouldEndByText =
      terminatingText && event.message?.text?.includes(terminatingText);

    return shouldEndByType || !!shouldEndByText;
  }

  /**
   * Type guard to determine if a Salesforce event type can contain an agent name.
   * Currently, only ChatMessage and ChatTransferred events can carry agent names.
   * This helps TypeScript narrow down the event types for better type safety.
   */
  private isAgentNameBearingEvent(
    type: string,
  ): type is "ChatMessage" | "ChatTransferred" {
    return (
      type === SALESFORCE_MESSAGE_TYPES.ChatMessage ||
      type === SALESFORCE_MESSAGE_TYPES.ChatTransferred
    );
  }

  /**
   * Extracts the agent name from a Salesforce chat event.
   * Returns the agent's name if the event is of a type that can contain agent names
   * (ChatMessage or ChatTransferred) and has a name in its message payload.
   * Otherwise returns null.
   */
  private getAgentName(event: SalesforceChatMessage): string | null {
    if (this.isAgentNameBearingEvent(event.type) && event.message?.name) {
      return event.message.name;
    }
    return null;
  }

  formatMessages(messages: Message[], _mavenConversationId: string): Message[] {
    return messages.filter((message) =>
      MESSAGE_TYPES_FOR_HANDOFF_CREATION.includes(message.type),
    );
  }

  handleChatEvent(event: SalesforceChatMessage): {
    shouldEndHandoff: boolean;
    agentName?: string | null;
    formattedEvent?: SalesforceChatMessage;
  } {
    const agentName = this.getAgentName(event);
    const shouldEndHandoff = this.shouldEndHandoff(event);

    if (shouldEndHandoff) {
      const isFailUnavailableEvent = isChatRequestFailUnavailable(
        event as SalesforceChatRequestFail,
      );

      if (!isFailUnavailableEvent) {
        return { shouldEndHandoff: true };
      }
    }

    const formattedEvent = {
      ...event,
      timestamp: new Date().getTime(),
    } as SalesforceChatMessage;

    return { agentName, formattedEvent, shouldEndHandoff };
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

  isLiveHandoffAvailable? = async () => {
    return true;
  };

  fetchHandoffAvailability = async () => {
    try {
      if (!this.configuration.enableAvailabilityCheck) {
        return true;
      }

      const url =
        this.configuration.chatHostUrl +
        "/chat/rest/Visitor/Availability?" +
        new URLSearchParams({
          org_id: this.configuration.orgId,
          deployment_id: this.configuration.deploymentId,
          "Availability.ids": this.configuration.chatButtonId,
        });

      const response = await fetch(url, {
        method: "GET",
        headers: {
          "X-LIVEAGENT-API-VERSION": SALESFORCE_API_VERSION,
        },
      });

      if (!response.ok) {
        return true;
      }

      const data = (await response.json()) as ChatAvailabilityResponse;
      const availabilityMessage = data?.messages?.find(
        (message: any) => message.type === "Availability",
      );
      const result = availabilityMessage?.message?.results?.find(
        (result: any) => result.id === this.configuration.chatButtonId,
      );

      if (result) {
        return !!result.isAvailable; // undefined and false are both false
      }

      return true;
    } catch (error) {
      console.error("Error fetching handoff availability:", error);
      return true;
    }
  };
}
