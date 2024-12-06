type ZendeskMessagePayload = {
  webhookId: string;
  // signature: string;
  // timestamp: string;
  // rawBody: string;
  event: HandoffChatMessage;
};
