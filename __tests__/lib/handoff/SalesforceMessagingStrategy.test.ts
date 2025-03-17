import { describe, it, expect, beforeEach } from "vitest";
import { SalesforceMessagingStrategy } from "@/src/lib/handoff/SalesforceMessagingStrategy";

describe("SalesforceMessagingStrategy", () => {
  let strategy: SalesforceMessagingStrategy;

  beforeEach(() => {
    strategy = new SalesforceMessagingStrategy({
      type: "salesforce-messaging",
    });
  });

  describe("properties", () => {
    it("should have required endpoints", () => {
      expect(strategy.messagesEndpoint).toBe("/api/salesforce/messages");
      expect(strategy.conversationsEndpoint).toBe(
        "/api/salesforce/conversations",
      );
    });
  });

  describe("methods", () => {
    it("should have formatMessages method", () => {
      expect(typeof strategy.formatMessages).toBe("function");
    });

    it("should have handleChatEvent method", () => {
      expect(typeof strategy.handleChatEvent).toBe("function");
    });
  });
});
