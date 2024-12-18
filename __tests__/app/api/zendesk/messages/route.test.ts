import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import jwt from "jsonwebtoken";
import { POST } from "@/app/api/zendesk/conversations/route";
import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from "@/app/api/zendesk/utils";
import { HANDOFF_AUTH_HEADER } from "@/app/constants/authentication";
import type SunshineConversationsClientModule from "sunshine-conversations-client";
// Mock all external dependencies
vi.mock("nanoid", () => ({ nanoid: vi.fn() }));
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn() },
  sign: vi.fn(),
}));
vi.mock("@/app/api/zendesk/utils", () => ({
  getSunshineConversationsClient: vi.fn(),
  postMessagesToZendeskConversation: vi.fn(),
}));
vi.mock("@/app/api/server/utils", () => ({
  decryptAndVerifySignedUserData: vi.fn(async (userDataString) =>
    JSON.parse(userDataString),
  ),
  withAppSettings: vi.fn((req, handler) =>
    handler(req, {
      handoffConfiguration: {
        apiKey: "test-key",
        apiSecret: "test-secret",
      },
    }),
  ),
}));

describe("POST /api/zendesk/conversations", () => {
  // Test fixtures
  const TEST_DATA = {
    USER_ID: "test-user-id",
    CONVERSATION_ID: "test-conversation-id",
    APP_ID: "test-app-id",
    EMAIL: "test@example.com",
    JWT_TOKEN: "test-jwt-token",
    NANOID: "test-nanoid",
    DEFAULT_MESSAGE: { content: "Test message" },
  };

  const AUTHENTICATED_USER = {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
  };

  // Helper to create mock request
  const createMockRequest = ({
    messages = [TEST_DATA.DEFAULT_MESSAGE],
    signedUserData = null,
    email = TEST_DATA.EMAIL,
  }: {
    messages?: any[];
    signedUserData?: string | null;
    email?: string | null;
  } = {}) =>
    ({
      json: vi.fn().mockResolvedValue({
        messages,
        signedUserData,
        email: email || undefined,
      }),
    }) as unknown as NextRequest;

  // Mock API instances
  const mockApiInstances = {
    users: {
      getUser: vi.fn().mockRejectedValue({ status: 404 }),
      createUser: vi
        .fn()
        .mockResolvedValue({ user: { id: TEST_DATA.USER_ID } }),
    },
    conversations: {
      listConversations: vi.fn().mockResolvedValue({ conversations: [] }),
      createConversation: vi.fn().mockResolvedValue({
        conversation: { id: TEST_DATA.CONVERSATION_ID },
      }),
    },
    conversationBody: {
      setParticipants: vi.fn(),
      setDisplayName: vi.fn(),
      setDescription: vi.fn(),
    },
  };

  beforeEach(() => {
    // Setup default mocks
    const mockClient = {
      UsersApi: vi.fn().mockReturnValue(mockApiInstances.users),
      ConversationsApi: vi.fn().mockReturnValue(mockApiInstances.conversations),
      ConversationCreateBody: vi
        .fn()
        .mockReturnValue(mockApiInstances.conversationBody),
    } as unknown as typeof SunshineConversationsClientModule;

    vi.mocked(getSunshineConversationsClient).mockResolvedValue([
      mockClient,
      TEST_DATA.APP_ID,
    ]);
    vi.mocked(nanoid).mockReturnValue(TEST_DATA.NANOID);
    vi.mocked(jwt.sign).mockReturnValue(TEST_DATA.JWT_TOKEN);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("User Creation", () => {
    it("should create an anonymous user when no signed user data is provided", async () => {
      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(mockApiInstances.users.createUser).toHaveBeenCalledWith(
        TEST_DATA.APP_ID,
        {
          externalId: `maven-anonymous-user-${TEST_DATA.NANOID}`,
          profile: undefined,
        },
      );
      expect(response.headers.get(HANDOFF_AUTH_HEADER)).toBe(
        TEST_DATA.JWT_TOKEN,
      );
    });

    it("should create an authenticated user with profile data", async () => {
      const response = await POST(
        createMockRequest({
          signedUserData: JSON.stringify(AUTHENTICATED_USER),
          email: AUTHENTICATED_USER.email,
        }) as unknown as NextRequest,
      );

      expect(mockApiInstances.users.createUser).toHaveBeenCalledWith(
        TEST_DATA.APP_ID,
        {
          externalId: AUTHENTICATED_USER.email,
          profile: {
            givenName: AUTHENTICATED_USER.firstName,
            surname: AUTHENTICATED_USER.lastName,
            email: AUTHENTICATED_USER.email,
            locale: "en-US",
          },
        },
      );
      expect(response.headers.get(HANDOFF_AUTH_HEADER)).toBe(
        TEST_DATA.JWT_TOKEN,
      );
    });

    it("should return 400 when user identification is missing", async () => {
      const response = await POST(createMockRequest({ email: null }));

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({ success: false });
    });
  });

  describe("Conversation Management", () => {
    it("should create a new conversation with correct parameters", async () => {
      await POST(createMockRequest());

      expect(
        mockApiInstances.conversationBody.setParticipants,
      ).toHaveBeenCalledWith([
        { userId: TEST_DATA.USER_ID, subscribeSDKClient: false },
      ]);
      expect(
        mockApiInstances.conversationBody.setDisplayName,
      ).toHaveBeenCalledWith("Chat with Support");
      expect(
        mockApiInstances.conversationBody.setDescription,
      ).toHaveBeenCalledWith("A conversation for customer support inquiries.");
    });

    it("should post messages including system notification", async () => {
      await POST(createMockRequest());

      expect(postMessagesToZendeskConversation).toHaveBeenCalledWith(
        expect.anything(),
        TEST_DATA.CONVERSATION_ID,
        TEST_DATA.USER_ID,
        TEST_DATA.APP_ID,
        expect.arrayContaining([
          TEST_DATA.DEFAULT_MESSAGE,
          expect.objectContaining({
            author: { type: "business", userId: TEST_DATA.USER_ID },
            content: {
              type: "text",
              text: expect.stringContaining(TEST_DATA.EMAIL),
            },
          }),
        ]),
      );
    });
  });
});
