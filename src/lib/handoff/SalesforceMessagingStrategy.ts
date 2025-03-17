import {
  type HandoffStrategy,
  type ServerHandoffStrategy,
} from "./HandoffStrategy";

export class SalesforceMessagingStrategy implements HandoffStrategy<any> {
  readonly messagesEndpoint = "/api/salesforce-messaging/messages";
  readonly conversationsEndpoint = "/api/salesforce-messaging/conversations";

  constructor(private readonly configuration: ClientSafeHandoffConfig) {}

  formatMessages(messages: any[]) {
    return messages;
  }

  handleChatEvent(event: any) {
    return {
      agentName: null,
      formattedEvent: event,
      shouldEndHandoff: false,
    };
  }
}

export class SalesforceServerStrategy implements ServerHandoffStrategy {
  constructor(private configuration: SalesforceHandoffConfiguration) {}

  isLiveHandoffAvailable? = async () => {
    return true;
  };

  fetchHandoffAvailability = async () => {
    return true;
  };
}
