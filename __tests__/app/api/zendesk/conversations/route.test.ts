import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { POST } from "@/src/app/api/zendesk/conversations/route";
import {
  getSunshineConversationsClient,
  postMessagesToZendeskConversation,
} from "@/src/app/api/zendesk/utils";
import { HANDOFF_AUTH_HEADER } from "@/src/app/constants/authentication";
import { NextRequest } from "next/server";
import { withAppSettings } from "@/src/app/api/server/utils";
// Mock all external dependencies
vi.mock("nanoid", () => ({
  nanoid: () => "test-nanoid",
}));
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn() },
  sign: vi.fn(),
}));
vi.mock("@/src/app/api/zendesk/utils", () => ({
  getSunshineConversationsClient: vi.fn(),
  postMessagesToZendeskConversation: vi.fn(),
}));
vi.mock("@/src/app/api/server/utils", () => ({
  decryptAndVerifySignedUserData: vi.fn(async (userDataString) =>
    JSON.parse(userDataString),
  ),
  withAppSettings: vi.fn((req, handler) =>
    handler(req, {
      branding: {},
      security: {},
      misc: {
        handoffConfiguration: {
          type: "zendesk",
          apiKey: "test-key",
          apiSecret: "test-secret",
        },
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
  } = {}) => ({
    json: vi.fn().mockResolvedValue({
      messages,
      signedUserData,
      email: email || undefined,
    }),
  });

  let mockApiInstances: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Move mockApiInstances initialization here
    mockApiInstances = {
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

    // Setup default mocks
    const mockClient = {
      UsersApi: vi.fn().mockReturnValue(mockApiInstances.users),
      ConversationsApi: vi.fn().mockReturnValue(mockApiInstances.conversations),
      ConversationCreateBody: vi
        .fn()
        .mockReturnValue(mockApiInstances.conversationBody),
    };

    vi.mocked(getSunshineConversationsClient).mockResolvedValue([
      mockClient as any,
      TEST_DATA.APP_ID,
    ]);
    vi.mocked(jwt.sign).mockReturnValue(TEST_DATA.JWT_TOKEN);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration Validation", () => {
    it("should return 400 when handoff configuration is invalid", async () => {
      vi.mocked(withAppSettings).mockImplementationOnce((req, handler) =>
        handler(
          req,
          {
            branding: {},
            security: {},
            misc: {
              handoffConfiguration: {
                type: "zendesk",
                apiSecret: "test-secret",
                // Remove the apiKey from the handoff configuration
              } as HandoffConfiguration,
            },
          } as ParsedAppSettings,
          "test-org-id",
          "test-agent-id",
        ),
      );

      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error:
          "Missing required Zendesk configuration. Both apiKey and apiSecret are required.",
      });
    });
  });

  describe("User Creation", () => {
    it("should create an anonymous user when no signed user data is provided", async () => {
      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(200);

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
      const response = await POST(
        createMockRequest({ email: null }) as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error:
          "User identification required. Please provide either an email or signed user data.",
      });
    });
  });

  describe("Conversation Management", () => {
    it("should create a new conversation with correct parameters", async () => {
      await POST(createMockRequest() as unknown as NextRequest);

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

    it("should post messages including system notification for unauthenticated users", async () => {
      await POST(createMockRequest() as unknown as NextRequest);

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

    it("should not add system notification for authenticated users", async () => {
      await POST(
        createMockRequest({
          signedUserData: JSON.stringify(AUTHENTICATED_USER),
          email: AUTHENTICATED_USER.email,
        }) as unknown as NextRequest,
      );

      expect(postMessagesToZendeskConversation).toHaveBeenCalledWith(
        expect.anything(),
        TEST_DATA.CONVERSATION_ID,
        TEST_DATA.USER_ID,
        TEST_DATA.APP_ID,
        [TEST_DATA.DEFAULT_MESSAGE],
      );
    });
  });
});
