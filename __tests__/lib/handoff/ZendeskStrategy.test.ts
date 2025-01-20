import { describe, it, expect, beforeEach } from "vitest";
import { ZendeskStrategy } from "@/lib/handoff/ZendeskStrategy";
import {
  createUserMessage,
  createBotMessage,
  createZendeskEvent,
} from "./test-helpers";

describe("ZendeskStrategy", () => {
  let strategy: ZendeskStrategy;

  beforeEach(() => {
    strategy = new ZendeskStrategy();
  });

  describe("formatMessages", () => {
    it("formats user messages correctly", () => {
      const messages = [createUserMessage("Hello")];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "user" },
          content: { type: "text", text: "Hello" },
        },
      ]);
    });

    it("formats bot messages correctly", () => {
      const messages = [createBotMessage([{ text: "Hi" }, { text: " there" }])];

      const formatted = strategy.formatMessages(messages, "conv-123");
      expect(formatted).toEqual([
        {
          author: { type: "business" },
          content: { type: "text", text: "Hi there" },
        },
      ]);
    });
  });

  describe("handleChatEvent", () => {
    it("handles business author events", () => {
      const event = createZendeskEvent("business", "John Agent");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBe("John Agent");
      expect(formattedEvent).toEqual({
        ...event,
        type: "handoff-zendesk",
        timestamp: new Date(event.createdAt).getTime(),
      });
    });

    it("returns null for user author events", () => {
      const event = createZendeskEvent("user");

      const { agentName, formattedEvent } = strategy.handleChatEvent(event);
      expect(agentName).toBeNull();
      expect(formattedEvent).toBeNull();
    });
  });

  describe("endpoints", () => {
    it("has correct endpoints", () => {
      expect(strategy.getMessagesEndpoint).toBe("/api/zendesk/messages");
      expect(strategy.getConversationsEndpoint).toBe(
        "/api/zendesk/conversations",
      );
    });
  });
});
