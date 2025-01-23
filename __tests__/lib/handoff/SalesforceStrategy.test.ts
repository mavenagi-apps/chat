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
    it("formats user messages correctly (passthrough)", () => {
      const messages = [createUserMessage("Hello")];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          type: "USER",
          text: "Hello",
          timestamp: 123456789,
        },
      ]);
    });

    it("formats bot messages correctly (passthrough)", () => {
      const responses: BotResponse[] = [
        { type: "text", text: "Hi" },
        { type: "text", text: " there" },
      ];
      const messages = [createBotMessage(responses)];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          botMessageType: "BOT_RESPONSE",
          conversationMessageId: {
            agentId: "agent-123",
            appId: "app-123",
            organizationId: "org-123",
            referenceId: "msg-123",
            type: "CONVERSATION_MESSAGE",
          },
          metadata: {
            followupQuestions: [],
            sources: [],
          },
          type: "bot",
          responses: [
            { type: "text", text: "Hi" },
            { type: "text", text: " there" },
          ],
          timestamp: 123456789,
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
        type: "ChatTransferred",
        timestamp: expect.any(Number),
      });
    });

    it("handles other events correctly", () => {
      const event = createSalesforceEvent("ChatMessage");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
      expect(formattedEvent).toEqual({
        ...event,
        type: "ChatMessage",
        timestamp: expect.any(Number),
      });
    });
  });

  describe("endpoints", () => {
    it("has correct endpoints", () => {
      expect(strategy.messagesEndpoint).toBe("/api/salesforce/messages");
      expect(strategy.conversationsEndpoint).toBe(
        "/api/salesforce/conversations",
      );
    });
  });
});
