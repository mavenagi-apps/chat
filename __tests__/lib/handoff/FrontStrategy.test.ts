import { describe, it, expect, beforeEach } from "vitest";
import { FrontStrategy } from "@/lib/handoff/FrontStrategy";
import {
  createUserMessage,
  createBotMessage,
  createFrontEvent,
} from "./test-helpers";

describe("FrontStrategy", () => {
  let strategy: FrontStrategy;

  beforeEach(() => {
    strategy = new FrontStrategy();
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
      const messages = [
        createBotMessage([
          { type: "text", text: "Hi" },
          { type: "text", text: " there" },
        ]),
      ];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "business" },
          content: { type: "text", text: "Hi there" },
          timestamp: 123456789,
          mavenContext: {
            conversationId: "conv-123",
            conversationMessageId: {
              referenceId: "msg-123",
            },
          },
        },
      ]);
    });
  });

  describe("handleChatEvent", () => {
    it("formats Front events correctly", () => {
      const event = createFrontEvent("John", "Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: "front-agent",
        timestamp: 123456789000,
      });
    });

    it("handles events with missing names", () => {
      const event = createFrontEvent("", "Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("Agent");
      expect(formattedEvent.timestamp).toBe(123456789000);
    });
  });

  describe("endpoints", () => {
    it("has correct endpoints", () => {
      expect(strategy.messagesEndpoint).toBe("/api/front/messages");
      expect(strategy.conversationsEndpoint).toBe("/api/front/conversations");
    });
  });
});
