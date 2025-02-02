import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { GET, POST } from "@/app/api/salesforce/messages/route";
import { NextRequest, NextResponse } from "next/server";
import {
  sendChatMessage,
  validateSalesforceConfig,
  validateAuthHeaders,
} from "@/app/api/salesforce/utils";

const KEEPALIVE_TEXT = "event: keepalive\ndata: {}\n\n";

// Mock external dependencies
vi.mock("@/app/api/server/utils", () => ({
  withSettingsAndAuthentication: vi.fn((req, handler) =>
    handler(
      req,
      {
        handoffConfiguration: {
          type: "salesforce",
          chatHostUrl: "https://test.salesforce.com",
          apiSecret: "test-secret",
        },
      },
      "test-org-id",
      "test-agent-id",
      "test-user-id",
      "test-conversation-id",
      {
        affinityToken: "test-affinity-token",
        sessionKey: "test-session-key",
      },
    ),
  ),
}));

vi.mock("@/app/api/salesforce/utils", async () => {
  const actual = await vi.importActual("@/app/api/salesforce/utils");
  return {
    ...(actual as object),
    validateSalesforceConfig: vi.fn(),
    validateAuthHeaders: vi.fn(),
    sendChatMessage: vi.fn(),
  };
});

describe("Salesforce Messages API", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
    vi.clearAllMocks();
    process.env = {
      NODE_ENV: "test",
    } as NodeJS.ProcessEnv;
    vi.mocked(validateAuthHeaders).mockReturnValue(null);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("GET /api/salesforce/messages", () => {
    const createGetRequest = (
      headers: Record<string, string> = {},
      abortAfterCalls = 1,
    ) => {
      let callCount = 0;
      return {
        signal: {
          get aborted() {
            callCount++;
            return callCount > abortAfterCalls;
          },
        },
        headers: {
          get: vi.fn((key: string) => headers[key]),
        },
      } as unknown as NextRequest;
    };

    it("should stream messages successfully", async () => {
      const messages = [
        {
          type: "ChatMessage",
          message: { text: "Hello" },
        },
      ];

      const mockFetch = global.fetch as Mock;
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ messages, sequence: 1, offset: 0 }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 2, offset: 1 }),
        } as Response);

      // Allow 2 fetch calls before aborting
      const response = await GET(createGetRequest({}, 2));
      const reader = response.body?.getReader();
      const { value } = (await reader?.read()) || {};
      const text = new TextDecoder().decode(value);

      expect(response.status).toBe(200);
      expect(text).toContain("Hello");
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it("should handle empty message responses", async () => {
      const mockFetch = global.fetch as Mock;
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204,
        json: () => Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
      } as Response);

      // Abort after first call
      const response = await GET(createGetRequest({}, 1));
      const reader = response.body?.getReader();
      const { done } = (await reader?.read()) || {};

      expect(response.status).toBe(200);
      expect(done).toBe(true);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });

    describe("Error Handling", () => {
      let mockController: { enqueue: Mock; close: Mock; error: Mock };
      let mockReader: { read: Mock };

      beforeEach(() => {
        mockController = {
          enqueue: vi.fn(),
          close: vi.fn(),
          error: vi.fn(),
        };

        mockReader = {
          read: vi.fn().mockResolvedValue({ done: true }),
        };

        vi.stubGlobal("console", { ...console, error: vi.fn() });

        vi.stubGlobal(
          "ReadableStream",
          vi.fn().mockImplementation(({ start }) => {
            start(mockController);
            return {
              getReader: () => mockReader,
            };
          }),
        );
      });

      it("handles 403 errors gracefully during stream", async () => {
        const mockFetch = global.fetch as Mock;
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        const response = await GET(createGetRequest({}, 0));

        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
        expect(mockController.close).toHaveBeenCalled();
        expect(console.error).not.toHaveBeenCalled();
      });

      it("throws an error if 403 does not coincide with an aborted stream", async () => {
        const mockFetch = global.fetch as Mock;
        mockFetch.mockResolvedValueOnce({
          ok: false,
          status: 403,
        });

        // Use request that doesn't abort immediately
        const response = await GET(createGetRequest({}, 2));

        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
        expect(mockController.close).toHaveBeenCalled();
        expect(console.error).toHaveBeenCalled();
      });
    });

    describe("Keepalive Functionality", () => {
      let mockController: { enqueue: Mock; close: Mock };
      let mockReader: { read: Mock };

      beforeEach(() => {
        mockController = {
          enqueue: vi.fn(),
          close: vi.fn(),
        };

        mockReader = {
          read: vi.fn().mockResolvedValue({ done: true }),
        };

        vi.stubGlobal(
          "ReadableStream",
          vi.fn().mockImplementation(({ start }) => {
            start(mockController);
            return {
              getReader: () => mockReader,
            };
          }),
        );

        vi.useFakeTimers();
        // Ensure validateAuthHeaders returns null for all tests in this block
        vi.mocked(validateAuthHeaders).mockReturnValue(null);
      });

      afterEach(() => {
        vi.useRealTimers();
        vi.clearAllMocks();
      });

      it("should send keepalive messages at regular intervals when no messages are received", async () => {
        const mockFetch = global.fetch as Mock;
        // Setup fetch to return a pending promise we can control
        let fetchPromiseResolve: (value: any) => void = () => {};
        let fetchPromise = new Promise((resolve) => {
          fetchPromiseResolve = resolve;
        });

        mockFetch.mockImplementation(() => {
          // Each fetch call returns a new pending promise
          fetchPromise = new Promise((resolve) => {
            fetchPromiseResolve = resolve;
          });
          return fetchPromise;
        });

        // Start streaming but don't await completion
        GET(createGetRequest({}, 10));

        // Allow initial fetch to start
        await vi.runOnlyPendingTimersAsync();
        mockController.enqueue.mockClear();

        // Advance time to trigger keepalive
        await vi.advanceTimersByTimeAsync(10000);
        await vi.runOnlyPendingTimersAsync();

        const expectedKeepalive = new TextEncoder().encode(KEEPALIVE_TEXT);
        expect(mockController.enqueue).toHaveBeenCalledWith(expectedKeepalive);

        // Resolve pending fetch to clean up
        fetchPromiseResolve({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
        });
      });

      it("should reset keepalive timer when a message is sent", async () => {
        const mockFetch = global.fetch as Mock;
        // Setup fetch to return a pending promise we can control
        let fetchPromiseResolve: (value: any) => void = () => {};
        let fetchPromise = new Promise((resolve) => {
          fetchPromiseResolve = resolve;
        });
        let firstCall = true;

        mockFetch.mockImplementation(() => {
          // Each fetch call returns a new pending promise
          fetchPromise = new Promise((resolve) => {
            fetchPromiseResolve = resolve;
          });

          // First call resolves with a message, subsequent calls remain pending
          if (firstCall) {
            firstCall = false;
            fetchPromiseResolve({
              ok: true,
              json: () =>
                Promise.resolve({
                  messages: [
                    {
                      type: "ChatMessage",
                      message: { text: "Hello" },
                    },
                  ],
                  sequence: 1,
                  offset: 0,
                }),
            });
          }

          return fetchPromise;
        });

        // Start streaming but don't await completion
        GET(createGetRequest({}, 10));

        // Allow initial message to be processed
        await vi.runOnlyPendingTimersAsync();
        mockController.enqueue.mockClear();

        // Advance time to trigger keepalive
        await vi.advanceTimersByTimeAsync(10000);
        await vi.runOnlyPendingTimersAsync();

        const expectedKeepalive = new TextEncoder().encode(KEEPALIVE_TEXT);
        expect(mockController.enqueue).toHaveBeenCalledWith(expectedKeepalive);

        // Resolve pending fetch to clean up
        fetchPromiseResolve({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 2, offset: 1 }),
        });
      });

      it("should cleanup keepalive interval when stream ends", async () => {
        const mockFetch = global.fetch as Mock;
        // Setup fetch to resolve immediately for quick stream end
        mockFetch.mockImplementation(() =>
          Promise.resolve({
            ok: true,
            json: () =>
              Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
          }),
        );

        // Start streaming with immediate abort
        await GET(createGetRequest({}, 0));
        mockController.enqueue.mockClear();

        // Verify no keepalive after stream ends
        await vi.advanceTimersByTimeAsync(15000);
        expect(mockController.enqueue).not.toHaveBeenCalled();
        expect(mockController.close).toHaveBeenCalled();
      });

      it("should use default interval when env variable is not set", async () => {
        delete process.env.SALESFORCE_MESSAGE_STREAM_KEEPALIVE_INTERVAL;

        const mockFetch = global.fetch as Mock;
        // Setup fetch to return a pending promise we can control
        let fetchPromiseResolve: (value: any) => void = () => {};
        let fetchPromise = new Promise((resolve) => {
          fetchPromiseResolve = resolve;
        });

        mockFetch.mockImplementation(() => {
          // Each fetch call returns a new pending promise
          fetchPromise = new Promise((resolve) => {
            fetchPromiseResolve = resolve;
          });
          return fetchPromise;
        });

        // Start streaming but don't await completion
        GET(createGetRequest({}, 10));

        // Allow initial fetch to start
        await vi.runOnlyPendingTimersAsync();
        mockController.enqueue.mockClear();

        // Advance time to trigger keepalive
        await vi.advanceTimersByTimeAsync(10000);
        await vi.runOnlyPendingTimersAsync();

        const expectedKeepalive = new TextEncoder().encode(KEEPALIVE_TEXT);
        expect(mockController.enqueue).toHaveBeenCalledWith(expectedKeepalive);

        // Resolve pending fetch to clean up
        fetchPromiseResolve({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
        });
      });

      it("should use configured interval from env variable", async () => {
        process.env.SALESFORCE_MESSAGE_STREAM_KEEPALIVE_INTERVAL = "5000";

        const mockFetch = global.fetch as Mock;
        // Setup fetch to return a pending promise we can control
        let fetchPromiseResolve: (value: any) => void = () => {};
        let fetchPromise = new Promise((resolve) => {
          fetchPromiseResolve = resolve;
        });

        mockFetch.mockImplementation(() => {
          // Each fetch call returns a new pending promise
          fetchPromise = new Promise((resolve) => {
            fetchPromiseResolve = resolve;
          });
          return fetchPromise;
        });

        // Start streaming but don't await completion
        GET(createGetRequest({}, 10));

        // Allow initial fetch to start
        await vi.runOnlyPendingTimersAsync();
        mockController.enqueue.mockClear();

        // Advance time to trigger keepalive
        await vi.advanceTimersByTimeAsync(5000);
        await vi.runOnlyPendingTimersAsync();

        const expectedKeepalive = new TextEncoder().encode(KEEPALIVE_TEXT);
        expect(mockController.enqueue).toHaveBeenCalledWith(expectedKeepalive);

        // Resolve pending fetch to clean up
        fetchPromiseResolve({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
        });
      });

      it("should use default interval when env variable is invalid", async () => {
        process.env.SALESFORCE_MESSAGE_STREAM_KEEPALIVE_INTERVAL = "invalid";

        const mockFetch = global.fetch as Mock;
        // Setup fetch to return a pending promise we can control
        let fetchPromiseResolve: (value: any) => void = () => {};
        let fetchPromise = new Promise((resolve) => {
          fetchPromiseResolve = resolve;
        });

        mockFetch.mockImplementation(() => {
          // Each fetch call returns a new pending promise
          fetchPromise = new Promise((resolve) => {
            fetchPromiseResolve = resolve;
          });
          return fetchPromise;
        });

        // Start streaming but don't await completion
        GET(createGetRequest({}, 10));

        // Allow initial fetch to start
        await vi.runOnlyPendingTimersAsync();
        mockController.enqueue.mockClear();

        // Advance time to trigger keepalive
        await vi.advanceTimersByTimeAsync(10000);
        await vi.runOnlyPendingTimersAsync();

        const expectedKeepalive = new TextEncoder().encode(KEEPALIVE_TEXT);
        expect(mockController.enqueue).toHaveBeenCalledWith(expectedKeepalive);

        // Resolve pending fetch to clean up
        fetchPromiseResolve({
          ok: true,
          json: () => Promise.resolve({ messages: [], sequence: 1, offset: 0 }),
        });
      });
    });
  });

  describe("POST /api/salesforce/messages", () => {
    const createPostRequest = (message = "Test message") => ({
      json: vi.fn().mockResolvedValue({ message }),
    });

    it("should send message successfully", async () => {
      vi.mocked(sendChatMessage).mockResolvedValueOnce(
        new Response("Chat message sent", { status: 200 }),
      );

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
      expect(await response.json()).toBe("Chat message sent");
    });

    it("should handle send message failure", async () => {
      const originalConsole = globalThis.console;
      vi.stubGlobal("console", { ...console, error: vi.fn() });

      vi.mocked(sendChatMessage).mockRejectedValueOnce(
        new Error("Failed to send"),
      );

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(500);
      expect(await response.json()).toBe("Failed to send chat message");
      expect(console.error).toHaveBeenCalledOnce();

      vi.stubGlobal("console", originalConsole);
    });

    it("should validate configuration", async () => {
      const mockResponse = NextResponse.json(
        {
          success: false,
          error: "Invalid handoff configuration type. Expected 'salesforce'.",
        },
        { status: 400 },
      );
      vi.mocked(validateSalesforceConfig).mockReturnValueOnce(mockResponse);

      const response = await POST(
        createPostRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Invalid handoff configuration type. Expected 'salesforce'.",
      });
    });
  });
});
