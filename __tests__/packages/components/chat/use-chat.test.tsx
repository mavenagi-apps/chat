import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useChat } from "@/packages/components/chat/use-chat";
import { useAuth } from "@/app/providers/AuthProvider";
import { useParams } from "next/navigation";
import { ChatMessage } from "@/types";
import { NextResponse } from "next/server";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useParams: vi.fn(),
}));

vi.mock("@/app/providers/AuthProvider", () => ({
  useAuth: vi.fn(),
}));

// Mock fetch
global.fetch = vi.fn();

vi.mock("jose", () => ({
  decodeJwt: vi.fn().mockReturnValue({
    conversationId: "test-conversation-id",
  }),
}));

describe("useChat", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Setup default mocks
    (useParams as any).mockReturnValue({
      organizationId: "test-org",
      agentId: "test-agent",
    });

    (useAuth as any).mockReturnValue({
      signedUserData: "test-signed-data",
    });

    // Enhanced mock with stream and response.ok
    const mockStream = new ReadableStream({
      start(controller) {
        controller.close();
      },
    });

    (global.fetch as any).mockResolvedValue(
      new NextResponse(mockStream, {
        headers: {
          "X-Maven-Auth-Token": "mock-token",
        },
        status: 200,
      }),
    );
  });

  it("should initialize with empty messages", () => {
    const { result } = renderHook(() => useChat());

    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isResponseAvailable).toBeUndefined();
    expect(result.current.conversationId).toBeTruthy();
  });

  it("should add user message when askQuestion is called", async () => {
    const { result } = renderHook(() => useChat());

    const userMessage = {
      type: "USER",
      text: "Hello",
      timestamp: expect.any(Number),
    } as ChatMessage;

    await act(async () => {
      result.current.addMessage(userMessage);
    });

    expect(result.current.messages).toHaveLength(1);
    expect(result.current.messages[0]).toMatchObject(userMessage);
  });

  it("should make API call when user asks a question", async () => {
    // Mock successful API response
    const mockResponse = new Response(
      'data: {"eventType":"start","conversationMessageId":{"referenceId":"123"}}\n\n',
      {
        headers: {
          "X-Maven-Auth-Token": "mock-token",
        },
      },
    );
    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useChat());

    const userMessage = {
      type: "USER",
      text: "Hello",
      timestamp: expect.any(Number),
    } as ChatMessage;

    await act(async () => {
      result.current.addMessage(userMessage);
    });

    expect(global.fetch).toHaveBeenCalledWith(
      "/api/create",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Content-Type": "application/json",
          "X-Agent-Id": "test-agent",
          "X-Organization-Id": "test-org",
        }),
        body: expect.stringContaining('"question":"Hello"'),
      }),
    );
  });

  it("should handle streaming response events", async () => {
    // Create a more accurate stream simulation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        // Each chunk should be a complete SSE message
        const messages = [
          `data: ${JSON.stringify({
            eventType: "start",
            conversationMessageId: { referenceId: "123" },
          })}\n\n`,
          `data: ${JSON.stringify({
            eventType: "text",
            contents: "Hello there!",
          })}\n\n`,
        ];

        // Send each message as a separate chunk
        for (const msg of messages) {
          controller.enqueue(encoder.encode(msg));
          // Add a small delay to simulate real streaming
          await new Promise((resolve) => setTimeout(resolve, 10));
        }
        controller.close();
      },
    });

    const mockResponse = new Response(stream, {
      headers: {
        "X-Maven-Auth-Token": "mock-token",
      },
    });

    (global.fetch as any).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useChat());

    await act(async () => {
      result.current.addMessage({
        type: "USER",
        text: "Hello",
        timestamp: Date.now(),
      });
    });

    // Wait for streaming to complete
    await waitFor(
      () => {
        expect(result.current.messages).toHaveLength(2);
        expect(result.current.messages[1]).toMatchObject({
          type: "bot",
          responses: [{ text: "Hello there!", type: "text" }],
        });
      },
      { timeout: 1000 },
    );
  });
});
