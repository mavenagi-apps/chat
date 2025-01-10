import { describe, it, expect, beforeEach } from "vitest";
import { ZendeskStrategy } from "@/lib/handoff/ZendeskStrategy";
import { FrontStrategy } from "@/lib/handoff/FrontStrategy";
import {
  createUserMessage,
  createBotMessage,
  createZendeskEvent,
  createFrontEvent,
} from "./test-helpers";

describe("Handoff Strategies", () => {
  describe("ZendeskStrategy", () => {
    let strategy: ZendeskStrategy;

    beforeEach(() => {
      strategy = new ZendeskStrategy();
    });

    it("should format user messages correctly", () => {
      const messages = [createUserMessage("Hello")];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "user" },
          content: { type: "text", text: "Hello" },
        },
      ]);
    });

    it("should format bot messages correctly", () => {
      const messages = [createBotMessage([{ text: "Hi" }, { text: " there" }])];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "business" },
          content: { type: "text", text: "Hi there" },
        },
      ]);
    });

    it("should handle Zendesk chat events", () => {
      const event = createZendeskEvent("business", "John Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: "handoff-zendesk",
        timestamp: new Date(event.createdAt).getTime(),
      });
    });

    it("should handle user events", () => {
      const event = createZendeskEvent("user");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
      expect(formattedEvent).toBeNull();
    });
  });

  describe("FrontStrategy", () => {
    let strategy: FrontStrategy;

    beforeEach(() => {
      strategy = new FrontStrategy();
    });

    it("should format user messages correctly", () => {
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
              referenceId: "msg-123",
            },
          },
        },
      ]);
    });

    it("should format bot messages correctly", () => {
      const messages = [createBotMessage([{ text: "Hi" }, { text: " there" }])];

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

    it("should handle Front chat events", () => {
      const event = createFrontEvent("John", "Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: "front-agent",
        timestamp: 1672531200000,
      });
    });

    it("should handle Front events with missing names", () => {
      const event = createFrontEvent("", "Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("Agent");
      expect(formattedEvent.timestamp).toBe(1672531200000);
    });
  });
});
