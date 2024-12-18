import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/zendesk/webhook/route";
import { getRedisClient } from "@/app/api/server/lib/redis";

vi.mock("@/app/api/server/lib/redis", () => ({
  getRedisClient: vi.fn(),
}));

describe("POST /api/zendesk/webhook", () => {
  let mockRedisClient: {
    publish: vi.Mock;
  };
  let mockRequest: {
    text: vi.Mock;
  } & Partial<NextRequest>;

  beforeEach(() => {
    // Setup mock Redis client
    mockRedisClient = {
      publish: vi.fn().mockResolvedValue(true),
    };
    vi.mocked(getRedisClient).mockResolvedValue(mockRedisClient as any);

    // Setup mock request
    mockRequest = {
      text: vi.fn(),
    };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("when receiving valid webhook events", () => {
    const validPayload = {
      webhook: { id: "webhook-123" },
      events: [
        {
          type: "conversation:message",
          id: "event-123",
          payload: {
            conversation: {
              id: "conv-123",
            },
          },
        },
      ],
    };

    beforeEach(() => {
      mockRequest.text.mockResolvedValue(JSON.stringify(validPayload));
    });

    it("should publish the event to Redis", async () => {
      const response = await POST(mockRequest as NextRequest);

      expect(mockRedisClient.publish).toHaveBeenCalledWith(
        "zendesk:conv-123:webhook-123:event-123",
        JSON.stringify({
          webhookId: "webhook-123",
          event: validPayload.events[0],
        }),
      );

      expect(await response.json()).toEqual({ success: true });
    });
  });

  describe("when receiving non-conversation events", () => {
    const nonConversationPayload = {
      webhook: { id: "webhook-123" },
      events: [
        {
          type: "other:event",
          id: "event-123",
          payload: {
            conversation: {
              id: "conv-123",
            },
          },
        },
      ],
    };

    beforeEach(() => {
      mockRequest.text.mockResolvedValue(
        JSON.stringify(nonConversationPayload),
      );
    });

    it("should not publish non-conversation events to Redis", async () => {
      const response = await POST(mockRequest as NextRequest);

      expect(mockRedisClient.publish).not.toHaveBeenCalled();
      expect(await response.json()).toEqual({ success: true });
    });
  });

  describe("when receiving invalid event data", () => {
    const testCases = [
      {
        name: "missing conversation id",
        payload: {
          webhook: { id: "webhook-123" },
          events: [
            {
              type: "conversation:message",
              id: "event-123",
              payload: {},
            },
          ],
        },
      },
      {
        name: "missing event id",
        payload: {
          webhook: { id: "webhook-123" },
          events: [
            {
              type: "conversation:message",
              payload: {
                conversation: {
                  id: "conv-123",
                },
              },
            },
          ],
        },
      },
      {
        name: "empty events array",
        payload: {
          webhook: { id: "webhook-123" },
          events: [],
        },
      },
    ];

    testCases.forEach(({ name, payload }) => {
      it(`should handle ${name}`, async () => {
        mockRequest.text.mockResolvedValue(JSON.stringify(payload));

        const response = await POST(mockRequest as NextRequest);

        expect(mockRedisClient.publish).not.toHaveBeenCalled();
        expect(await response.json()).toEqual({ success: true });
      });
    });
  });

  describe("when ENABLE_API_LOGGING is true", () => {
    const originalEnv = process.env.ENABLE_API_LOGGING;

    beforeEach(() => {
      process.env.ENABLE_API_LOGGING = "true";
      vi.spyOn(console, "log").mockImplementation(() => {});
    });

    afterEach(() => {
      process.env.ENABLE_API_LOGGING = originalEnv;
    });

    it("should log the raw body", async () => {
      const payload = {
        webhook: { id: "webhook-123" },
        events: [],
      };
      mockRequest.text.mockResolvedValue(JSON.stringify(payload));

      await POST(mockRequest as NextRequest);

      expect(console.log).toHaveBeenCalledWith(JSON.stringify(payload));
    });
  });
});
