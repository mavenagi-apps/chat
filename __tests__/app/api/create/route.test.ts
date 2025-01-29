import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  test,
  Mock,
} from "vitest";
import { nanoid } from "nanoid";
import { MavenAGI, MavenAGIError, MavenAGIClient } from "mavenagi";
import { POST } from "@/app/api/create/route";
import { getMavenAGIClient } from "@/app";
import { verifyAuthToken } from "@/app/api/server/utils";
import { NextRequest } from "next/server";
vi.mock("nanoid", () => ({ nanoid: vi.fn() }));
vi.mock("@/app", () => ({ getMavenAGIClient: vi.fn() }));
vi.mock("@/app/api/server/utils", () => ({
  decryptAndVerifySignedUserData: vi.fn(async (userDataString) =>
    JSON.parse(userDataString),
  ),
  generateAuthToken: vi.fn(() => "mock-auth-token"),
  verifyAuthToken: vi.fn(),
  withAppSettings: vi.fn((req, handler) => handler(req, {}, "org1", "agent1")),
}));

describe("POST /api/create", () => {
  let mockClient: {
    users: {
      createOrUpdate: Mock;
    };
    conversation: {
      initialize: Mock;
      askStream: Mock;
    };
  };
  let mockRequest: {
    json: Mock;
    headers: Headers;
  } & Partial<NextRequest>;

  const setupMockClient = () => ({
    users: {
      createOrUpdate: vi.fn().mockImplementation((userRequest) => ({
        ...userRequest,
        userId: {
          ...userRequest.userId,
          appId: "myapp",
          organizationId: "acme",
          agentId: "support",
          type: MavenAGI.EntityType.UserProfile,
        },
        allUserData: {},
        defaultUserData: {},
      })),
    },
    conversation: {
      initialize: vi.fn(),
      askStream: vi.fn().mockImplementation(() => {
        async function* generateMockStream() {
          yield {
            eventType: "start",
            conversationMessageId: {
              type: "CONVERSATION_MESSAGE",
              appId: "myapp",
              organizationId: "acme",
              agentId: "support",
              referenceId: "conversation-message-id-1",
            },
          };
          yield { eventType: "text", contents: "Hello" };
          yield { eventType: "text", contents: " World" };
          yield { eventType: "end" };
        }
        return generateMockStream();
      }),
    },
  });

  const setupMockRequest = (
    signedUserData: string | null = null,
    unsignedUserData: Record<string, any> | null = null,
  ) => ({
    json: vi.fn().mockResolvedValue({
      question: "Test question",
      signedUserData,
      unsignedUserData,
    }),
    headers: new Headers(),
  });

  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mockClient = setupMockClient();
    mockRequest = setupMockRequest();
    vi.mocked(nanoid).mockReturnValue("mock-id");
    vi.mocked(getMavenAGIClient).mockReturnValue(
      mockClient as unknown as MavenAGIClient,
    );
    vi.mocked(verifyAuthToken).mockImplementation((jsonString) =>
      JSON.parse(jsonString),
    );
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const testConversationInitialization = (
    unsignedUserData?: Record<string, any>,
  ) => {
    test("should create a new conversation", async () => {
      await POST(mockRequest as NextRequest);

      const expectedInitPayload: any = {
        conversationId: { referenceId: "mock-id" },
        messages: [],
        responseConfig: {
          capabilities: [
            MavenAGI.Capability.Markdown,
            MavenAGI.Capability.Forms,
            MavenAGI.Capability.ChartsHighchartsTs,
          ],
          isCopilot: false,
          responseLength: MavenAGI.ResponseLength.Medium,
        },
        metadata: {
          escalation_action_enabled: "true",
          handoff_available: "false",
        },
      };

      if (unsignedUserData) {
        expectedInitPayload.messages = [
          {
            conversationMessageId: { referenceId: "mock-id" },
            userId: { referenceId: "system" },
            text: `Customer's Information: ${JSON.stringify(unsignedUserData)}`,
            userMessageType: "EXTERNAL_SYSTEM",
          },
        ];
      }

      expect(mockClient.conversation.initialize).toHaveBeenCalledWith(
        expectedInitPayload,
      );
    });
  };

  const testResponseStructure = () => {
    describe("response", () => {
      test("should return a stream", async () => {
        const response = await POST(mockRequest as NextRequest);
        expect(response).toBeInstanceOf(Response);
        expect(response.headers.get("Content-Type")).toBe("text/event-stream");
      });

      test("should include an auth token in the headers", async () => {
        const response = await POST(mockRequest as NextRequest);
        expect(response.headers.get("X-Maven-Auth-Token")).toBe(
          "mock-auth-token",
        );
      });
    });
  };

  describe("when the user does not have an auth token", () => {
    describe("and the user does not have signed user data", () => {
      testConversationInitialization();

      test("should create a new user with anonymous user id", async () => {
        await POST(mockRequest as NextRequest);
        expect(mockClient.users.createOrUpdate).toHaveBeenCalledWith({
          userId: { referenceId: "chat-anonymous-user-mock-id" },
          identifiers: [],
          data: {},
        });
      });

      test("should call askStream with the correct parameters", async () => {
        await POST(mockRequest as NextRequest);
        expect(mockClient.conversation.askStream).toHaveBeenCalledWith(
          "mock-id",
          {
            userId: { referenceId: "chat-anonymous-user-mock-id" },
            conversationMessageId: { referenceId: "mock-id" },
            text: "Test question",
          },
        );
      });

      testResponseStructure();
    });

    describe("and the user has unsigned user data", () => {
      const mockUnsignedData = {
        customField: "value",
        otherField: 123,
      };

      beforeEach(() => {
        mockRequest = setupMockRequest(null, mockUnsignedData);
      });

      testConversationInitialization(mockUnsignedData);

      test("should create a new user with anonymous user id", async () => {
        await POST(mockRequest as NextRequest);
        expect(mockClient.users.createOrUpdate).toHaveBeenCalledWith({
          userId: { referenceId: "chat-anonymous-user-mock-id" },
          identifiers: [],
          data: {},
        });
      });

      test("should call askStream with the correct parameters", async () => {
        await POST(mockRequest as NextRequest);
        expect(mockClient.conversation.askStream).toHaveBeenCalledWith(
          "mock-id",
          {
            userId: { referenceId: "chat-anonymous-user-mock-id" },
            conversationMessageId: { referenceId: "mock-id" },
            text: "Test question",
          },
        );
      });
    });

    describe("and the user has both signed and unsigned user data", () => {
      const mockUnsignedData = {
        customField: "value",
        otherField: 123,
      };

      beforeEach(() => {
        mockRequest = setupMockRequest(
          JSON.stringify({
            id: "signed-user-id",
            email: "user1@example.com",
            otherValue: "otherValue",
            firstName: "John",
            lastName: "Doe",
            objectField: { key: "value" },
            arrayField: ["one", "two"],
            nullField: null,
          }),
          mockUnsignedData,
        );
      });

      testConversationInitialization(mockUnsignedData);

      test("should create a new user", async () => {
        await POST(mockRequest as NextRequest);
        expect(mockClient.users.createOrUpdate).toHaveBeenCalledWith({
          userId: { referenceId: "signed-user-id" },
          identifiers: [{ type: "EMAIL", value: "user1@example.com" }],
          data: {
            otherValue: {
              value: "otherValue",
              visibility: MavenAGI.VisibilityType.Visible,
            },
            firstName: {
              value: "John",
              visibility: MavenAGI.VisibilityType.Visible,
            },
            lastName: {
              value: "Doe",
              visibility: MavenAGI.VisibilityType.Visible,
            },
            objectField: {
              value: JSON.stringify({ key: "value" }, null, 4),
              visibility: MavenAGI.VisibilityType.Visible,
            },
            arrayField: {
              value: JSON.stringify(["one", "two"], null, 4),
              visibility: MavenAGI.VisibilityType.Visible,
            },
            nullField: {
              value: null,
              visibility: MavenAGI.VisibilityType.Visible,
            },
          },
        });
      });

      test("should call askStream with the correct parameters", async () => {
        await POST(mockRequest as NextRequest);
        expect(mockClient.conversation.askStream).toHaveBeenCalledWith(
          "mock-id",
          {
            userId: { referenceId: "signed-user-id" },
            conversationMessageId: { referenceId: "mock-id" },
            text: "Test question",
          },
        );
      });

      testResponseStructure();
    });
  });

  describe("when the user has an auth token", () => {
    beforeEach(() => {
      mockRequest.headers.set(
        "X-Maven-Auth-Token",
        JSON.stringify({
          userId: "auth-user",
          conversationId: "existing-convo",
        }),
      );
    });

    test("should not create a new conversation", async () => {
      await POST(mockRequest as NextRequest);
      expect(mockClient.conversation.initialize).not.toHaveBeenCalled();
    });

    test("should not create a new user", async () => {
      await POST(mockRequest as NextRequest);
      expect(mockClient.users.createOrUpdate).not.toHaveBeenCalled();
    });

    test("should call askStream with the correct parameters", async () => {
      await POST(mockRequest as NextRequest);
      expect(mockClient.conversation.askStream).toHaveBeenCalledWith(
        "existing-convo",
        {
          userId: { referenceId: "auth-user" },
          conversationMessageId: { referenceId: "mock-id" },
          text: "Test question",
        },
      );
    });
  });

  it("should handle MavenAGIError", async () => {
    const mockError = new MavenAGIError({
      body: "Bad request",
      statusCode: 400,
    });
    mockClient.conversation.askStream.mockRejectedValue(mockError);
    const response = await POST(mockRequest as NextRequest);
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({ error: "Bad request" });
  });

  it("should handle generic errors", async () => {
    mockClient.conversation.askStream.mockRejectedValue(
      new Error("Generic error"),
    );
    const response = await POST(mockRequest as NextRequest);
    expect(response.status).toBe(500);
    expect(await response.json()).toEqual({ error: "Error fetching response" });
  });
});
