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
    CUSTOM_FIELD_VALUES: {
      "1": "high",
      "2": "Bug report",
      "3": true,
    },
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
    customFieldValues = undefined,
  }: {
    messages?: any[];
    signedUserData?: string | null;
    email?: string | null;
    customFieldValues?: Record<string, string | boolean | number>;
  } = {}) => ({
    json: vi.fn().mockResolvedValue({
      messages,
      signedUserData,
      email: email || undefined,
      customFieldValues,
    }),
  });

  let mockApiInstances: any;
  let mockSwitchboardActionsApi: any;
  let mockPassControlBody: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Initialize mock instances
    mockPassControlBody = {
      setSwitchboardIntegration: vi.fn(),
      setMetadata: vi.fn(),
    };

    mockSwitchboardActionsApi = {
      passControl: vi.fn().mockResolvedValue({}),
    };

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
      SwitchboardActionsApi: vi.fn().mockReturnValue(mockSwitchboardActionsApi),
      PassControlBody: vi.fn().mockReturnValue(mockPassControlBody),
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

    it("should pass customFieldValues to getOrCreateZendeskConversation", async () => {
      await POST(
        createMockRequest({
          customFieldValues: TEST_DATA.CUSTOM_FIELD_VALUES,
        }) as unknown as NextRequest,
      );

      // Verify passControl was called with transformed custom fields
      expect(
        mockPassControlBody.setSwitchboardIntegration,
      ).toHaveBeenCalledWith("zd-agentWorkspace");

      // Check that metadata was set with prefixed custom fields
      expect(mockPassControlBody.setMetadata).toHaveBeenCalledWith({
        "dataCapture.ticketField.1": "high",
        "dataCapture.ticketField.2": "Bug report",
        "dataCapture.ticketField.3": true,
      });

      // Verify passControl was called with the right parameters
      expect(mockSwitchboardActionsApi.passControl).toHaveBeenCalledWith(
        TEST_DATA.APP_ID,
        TEST_DATA.CONVERSATION_ID,
        mockPassControlBody,
      );
    });

    it("should not call passControl when customFieldValues is not provided", async () => {
      await POST(
        createMockRequest({
          customFieldValues: undefined,
        }) as unknown as NextRequest,
      );

      // Verify passControl was not called
      expect(mockSwitchboardActionsApi.passControl).not.toHaveBeenCalled();
      expect(
        mockPassControlBody.setSwitchboardIntegration,
      ).not.toHaveBeenCalled();
      expect(mockPassControlBody.setMetadata).not.toHaveBeenCalled();
    });

    it("should handle errors when passControl fails", async () => {
      // Mock console.error to prevent test output noise
      const originalConsoleError = console.error;
      console.error = vi.fn();

      // Setup passControl to throw an error
      mockSwitchboardActionsApi.passControl.mockRejectedValueOnce(
        new Error("API Error"),
      );

      // Request should still succeed even if passControl fails
      const response = await POST(
        createMockRequest({
          customFieldValues: TEST_DATA.CUSTOM_FIELD_VALUES,
        }) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      expect(console.error).toHaveBeenCalledWith(
        "Error passing control to zendesk",
        expect.any(Error),
      );

      // Restore console.error
      console.error = originalConsoleError;
    });

    it("should include custom fields message when shouldIncludeCustomFieldsInHandoffMessage is enabled", async () => {
      // Mock withAppSettings to include the new configuration
      vi.mocked(withAppSettings).mockImplementationOnce((req, handler) =>
        handler(
          req,
          {
            branding: {},
            security: {},
            misc: {
              handoffConfiguration: {
                type: "zendesk",
                webhookId: "test-webhook-id",
                webhookSecret: "test-webhook-secret",
                subdomain: "test-subdomain",
                apiKey: "test-key",
                apiSecret: "test-secret",
                shouldIncludeCustomFieldsInHandoffMessage: true,
              } as ZendeskHandoffConfiguration,
            },
          } as ParsedAppSettings,
          "test-org-id",
          "test-agent-id",
        ),
      );

      await POST(
        createMockRequest({
          customFieldValues: TEST_DATA.CUSTOM_FIELD_VALUES,
        }) as unknown as NextRequest,
      );

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
              text: expect.stringContaining("Custom fields:"),
            },
          }),
        ]),
      );
    });
  });
});
