import { describe, it, expect, beforeEach } from "vitest";
import { SalesforceStrategy } from "@/lib/handoff/SalesforceStrategy";
import {
  createUserMessage,
  createBotMessage,
  createSalesforceEvent,
  BotResponse,
} from "./test-helpers";

describe("SalesforceStrategy", () => {
  let strategy: SalesforceStrategy;

  beforeEach(() => {
    strategy = new SalesforceStrategy();
  });

  describe("formatMessages", () => {
    it("formats user messages correctly", () => {
      const messages = [createUserMessage("Hello")];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "user" },
          content: { type: "text", text: "Hello" },
          timestamp: 123456789,
          mavenContext: {
            conversationId: "conv-123",
            conversationMessageId: {
              referenceId: undefined,
            },
          },
        },
      ]);
    });

    it("formats bot messages correctly", () => {
      const responses: BotResponse[] = [
        { type: "text", text: "Hi" },
        { type: "text", text: " there" },
      ];
      const messages = [createBotMessage(responses)];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "business" },
          content: { type: "text", text: "Hi there" },
          timestamp: 123456789,
          mavenContext: {
            conversationId: "conv-123",
            conversationMessageId: {
              referenceId: undefined,
            },
          },
        },
      ]);
    });
  });

  describe("handleChatEvent", () => {
    it("handles ChatTransferred events correctly", () => {
      const event = createSalesforceEvent("ChatTransferred", "John Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: "handoff-salesforce",
        timestamp: expect.any(Number),
      });
    });

    it("handles other events correctly", () => {
      const event = createSalesforceEvent("ChatMessage");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
      expect(formattedEvent).toEqual({
        ...event,
        type: "handoff-salesforce",
        timestamp: expect.any(Number),
      });
    });
  });

  describe("message retrieval configuration", () => {
    it("uses polling for message retrieval", () => {
      expect(strategy.messageRetrievalType).toBe("poll");
      expect(strategy.pollInterval).toBe(3000);
    });
  });

  describe("endpoints", () => {
    it("has correct endpoints", () => {
      expect(strategy.getMessagesEndpoint).toBe("/api/salesforce/messages");
      expect(strategy.getConversationsEndpoint).toBe(
        "/api/salesforce/conversations",
      );
    });
  });
});
