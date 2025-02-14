import {
  vi,
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import jwt from "jsonwebtoken";
import { POST } from "@/app/api/salesforce/conversations/route";
import { HANDOFF_AUTH_HEADER } from "@/app/constants/authentication";
import { NextRequest } from "next/server";
import {
  withAppSettings,
  decryptAndVerifySignedUserData,
} from "@/app/api/server/utils";
import { sendChatMessage, fetchChatMessages } from "@/app/api/salesforce/utils";
import type { SalesforceChatUserData } from "@/types/salesforce";
import { SALESFORCE_MESSAGE_TYPES } from "@/types/salesforce";

// Test fixtures
const TEST_DATA = {
  SESSION_ID: "test-session-id",
  SESSION_KEY: "test-session-key",
  AFFINITY_TOKEN: "test-affinity-token",
  JWT_TOKEN: "test-jwt-token",
  DEFAULT_MESSAGE: { content: "Test message" },
};

const TEST_USER = {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
};

// Default Salesforce configuration for tests
const DEFAULT_SALESFORCE_CONFIG = {
  type: "salesforce" as const,
  chatHostUrl: "https://test.salesforce.com",
  chatButtonId: "test-button-id",
  deploymentId: "test-deployment-id",
  orgId: "test-org-id",
  eswLiveAgentDevName: "test-dev-name",
  apiSecret: "test-secret",
  allowAnonymousHandoff: false,
};

// Mock external dependencies
vi.mock("jsonwebtoken", () => ({
  default: { sign: vi.fn() },
  sign: vi.fn(),
}));

vi.mock("@/app/api/server/utils", () => ({
  withAppSettings: vi.fn((req, handler) =>
    handler(
      req,
      {
        branding: {},
        security: {},
        misc: {
          handoffConfiguration: DEFAULT_SALESFORCE_CONFIG,
        },
      } as ParsedAppSettings,
      "test-org-id",
      "test-agent-id",
    ),
  ),
  decryptAndVerifySignedUserData: vi.fn(),
}));

vi.mock("@/app/api/salesforce/utils", async () => {
  const actual = await vi.importActual("@/app/api/salesforce/utils");
  return {
    ...(actual as object),
    sendChatMessage: vi.fn(),
    fetchChatMessages: vi.fn().mockResolvedValue({
      messages: [],
      sequence: 0,
      offset: 0,
    }),
  };
});

describe("POST /api/salesforce/conversations", () => {
  interface MockRequestParams {
    messages?: { content: string }[];
    unsignedUserData?: SalesforceChatUserData;
    signedUserData?: string;
    email?: string;
    userAgent?: string;
    screenResolution?: string;
    language?: string;
    customData?: {
      buttonId?: string;
      eswLiveAgentDevName?: string;
    };
    headers?: Record<string, string>;
  }

  // Helper to create mock request
  const createMockRequest = ({
    messages = [TEST_DATA.DEFAULT_MESSAGE],
    unsignedUserData,
    signedUserData,
    email,
    userAgent = "test-user-agent",
    screenResolution = "1920x1080",
    language = "en-US",
    customData,
    headers = {},
  }: MockRequestParams) => {
    const request = new Request(
      "https://test.com/api/salesforce/conversations",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        body: JSON.stringify({
          messages,
          unsignedUserData,
          signedUserData,
          email,
          userAgent,
          screenResolution,
          language,
          customData,
        }),
      },
    );

    return Object.assign(request, {
      json: () =>
        Promise.resolve({
          messages,
          unsignedUserData,
          signedUserData,
          email,
          userAgent,
          screenResolution,
          language,
          customData,
        }),
    });
  };

  // Mock fetch responses with configurable behavior
  const mockFetchResponses = ({
    sessionIdResponse = {
      ok: true,
      json: () =>
        Promise.resolve({
          id: TEST_DATA.SESSION_ID,
          key: TEST_DATA.SESSION_KEY,
          affinityToken: TEST_DATA.AFFINITY_TOKEN,
        }),
    },
    chasitorInitResponse = {
      ok: true,
      json: () => Promise.resolve({}),
    },
  } = {}) => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/SessionId")) {
        return Promise.resolve(sessionIdResponse);
      }
      if (url.includes("/ChasitorInit")) {
        return Promise.resolve(chasitorInitResponse);
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("console", { ...console, error: vi.fn() });
    mockFetchResponses();
    vi.mocked(jwt.sign).mockReturnValue(TEST_DATA.JWT_TOKEN);
    vi.mocked(decryptAndVerifySignedUserData).mockReset();
    vi.mocked(fetchChatMessages).mockReset().mockResolvedValue({
      messages: [],
      sequence: 0,
      offset: 0,
    });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Configuration Validation", () => {
    it("should return 400 when handoff configuration type is invalid", async () => {
      vi.mocked(withAppSettings).mockImplementationOnce((req, handler) =>
        handler(
          req,
          {
            branding: {},
            security: {},
            misc: {
              handoffConfiguration: {
                // @ts-expect-error - invalid type
                type: "invalid",
              },
            },
          },
          "test-org-id",
          "test-agent-id",
        ),
      );

      const response = await POST(
        createMockRequest({} as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        success: false,
        error: "Invalid handoff configuration type. Expected 'salesforce'.",
      });
    });
  });

  describe("Chat Session Initialization", () => {
    it("should successfully initialize a chat session", async () => {
      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      const responseData = await response.json();
      expect(responseData).toEqual({
        id: TEST_DATA.SESSION_ID,
        key: TEST_DATA.SESSION_KEY,
        affinityToken: TEST_DATA.AFFINITY_TOKEN,
      });

      expect(response.headers.get(HANDOFF_AUTH_HEADER)).toBe(
        TEST_DATA.JWT_TOKEN,
      );
    });

    it("should return 400 when user data is missing", async () => {
      const response = await POST({
        json: vi.fn().mockResolvedValue({
          messages: [TEST_DATA.DEFAULT_MESSAGE],
          unsignedUserData: null,
        }),
        headers: {
          get: vi.fn(),
        },
      } as unknown as NextRequest);

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Missing user data",
      });
    });

    it("should handle session initialization failure", async () => {
      vi.mocked(global.fetch).mockRejectedValueOnce(
        new Error("Failed to initialize session"),
      );

      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
    });

    it("includes originalReferrer in session init when present", async () => {
      const mockReferrer = "https://test-referrer.com";
      const request = createMockRequest({
        headers: { referer: mockReferrer },
        unsignedUserData: TEST_USER,
      } as MockRequestParams) as unknown as NextRequest;

      await POST(request);

      const initCall = (global.fetch as Mock).mock.calls.find(
        (call) =>
          typeof call[0] === "string" && call[0].includes("/ChasitorInit"),
      );
      const requestBody = JSON.parse(initCall?.[1]?.body as string);
      expect(requestBody.visitorInfo?.originalReferrer).toBe(mockReferrer);
    });

    it("handles missing referrer header gracefully", async () => {
      const request = createMockRequest({
        unsignedUserData: TEST_USER,
      } as MockRequestParams) as unknown as NextRequest;

      await POST(request);

      const initCall = (global.fetch as Mock).mock.calls.find(
        (call) =>
          typeof call[0] === "string" && call[0].includes("/ChasitorInit"),
      );
      const requestBody = JSON.parse(initCall?.[1]?.body as string);
      expect(requestBody.visitorInfo?.originalReferrer).toBe("unknown");
    });
  });

  describe("Message Handling", () => {
    describe("when fetchChatMessages returns a ChatRequestSuccess message", () => {
      beforeEach(() => {
        vi.mocked(fetchChatMessages).mockResolvedValueOnce({
          messages: [
            {
              type: SALESFORCE_MESSAGE_TYPES.ChatRequestSuccess,
              message: {
                text: "Test message",
                name: "ChatRequestSuccess",
                schedule: { responseDelayMilliseconds: 0 },
                agentId: "test-agent-id",
              },
            },
          ],
          sequence: 0,
          offset: 0,
        });
      });

      it("should send initial messages after session creation", async () => {
        await POST(
          createMockRequest({
            unsignedUserData: TEST_USER,
          } as MockRequestParams) as unknown as NextRequest,
        );

        expect(sendChatMessage).toHaveBeenCalled();
        expect(vi.mocked(sendChatMessage).mock.calls[0][0]).toContain(
          "MAVEN TRANSCRIPT HISTORY",
        );
      });
    });
  });

  describe("when fetchChatMessages does not return a ChatRequestSuccess message", () => {
    it("should not send initial messages after session creation", async () => {
      await POST(
        createMockRequest({} as MockRequestParams) as unknown as NextRequest,
      );

      expect(sendChatMessage).not.toHaveBeenCalled();
    });
  });

  describe("User Data Handling", () => {
    beforeEach(() => {
      // Reset all mocks before each test in this block
      vi.clearAllMocks();
      mockFetchResponses();
      vi.mocked(jwt.sign).mockReturnValue(TEST_DATA.JWT_TOKEN);
      vi.mocked(decryptAndVerifySignedUserData).mockReset();
      vi.mocked(fetchChatMessages).mockReset().mockResolvedValue({
        messages: [],
        sequence: 0,
        offset: 0,
      });
    });

    it("should handle email-only authentication", async () => {
      const testEmail = "test@example.com";
      const response = await POST(
        createMockRequest({
          email: testEmail,
          unsignedUserData: undefined,
          signedUserData: undefined,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      const fetchCalls = vi.mocked(global.fetch).mock.calls;
      const initRequestBody = JSON.parse(fetchCalls[1][1]?.body as string);
      expect(initRequestBody.prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "Email",
          value: testEmail,
        }),
      );
    });

    it("should handle signed user data when provided", async () => {
      const verifiedUser = {
        ...TEST_USER,
        userId: "test-user-id",
      };
      vi.mocked(decryptAndVerifySignedUserData).mockResolvedValueOnce(
        verifiedUser,
      );

      const response = await POST(
        createMockRequest({
          signedUserData: "encrypted-data",
          unsignedUserData: undefined,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      expect(decryptAndVerifySignedUserData).toHaveBeenCalledWith(
        "encrypted-data",
        expect.any(Object),
      );
    });

    it("should prefer signed user data over unsigned data and email when all are provided", async () => {
      const verifiedUser = {
        ...TEST_USER,
        userId: "verified-user-id",
      };
      vi.mocked(decryptAndVerifySignedUserData).mockResolvedValueOnce(
        verifiedUser,
      );

      const response = await POST(
        createMockRequest({
          signedUserData: "encrypted-data",
          unsignedUserData: { ...TEST_USER, userId: "unsigned-user-id" },
          email: "different@example.com",
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      // Verify the request body used verified user data
      const fetchCalls = vi.mocked(global.fetch).mock.calls;
      const initRequestBody = JSON.parse(fetchCalls[1][1]?.body as string);
      expect(initRequestBody.prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "User Id",
          value: "verified-user-id",
        }),
      );
    });

    it("should prefer unsigned user data over email when both are provided", async () => {
      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
          email: "different@example.com",
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      const fetchCalls = vi.mocked(global.fetch).mock.calls;
      const initRequestBody = JSON.parse(fetchCalls[1][1]?.body as string);
      expect(initRequestBody.prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "Email",
          value: TEST_USER.email,
        }),
      );
    });

    it("should handle custom button ID and eswLiveAgentDevName", async () => {
      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
          customData: {
            buttonId: "custom-button-id",
            eswLiveAgentDevName: "custom-dev-name",
          },
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      const fetchCalls = vi.mocked(global.fetch).mock.calls;
      const initCall = fetchCalls.find(
        (call) =>
          typeof call[0] === "string" && call[0].includes("/ChasitorInit"),
      );
      const requestBody = JSON.parse(initCall?.[1]?.body as string);

      expect(requestBody.buttonId).toBe("custom-button-id");
      expect(requestBody.prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "eswLiveAgentDevName",
          value: "custom-dev-name",
        }),
      );
    });

    it("should return 400 when no user data is provided and anonymous handoff is disabled", async () => {
      // Mock the configuration with anonymous handoff disabled
      vi.mocked(withAppSettings).mockImplementationOnce((req, handler) =>
        handler(
          req,
          {
            branding: {},
            security: {},
            misc: {
              handoffConfiguration: {
                type: "salesforce" as const,
                chatHostUrl: "https://test.salesforce.com",
                chatButtonId: "test-button-id",
                deploymentId: "test-deployment-id",
                orgId: "test-org-id",
                eswLiveAgentDevName: "test-dev-name",
                apiSecret: "test-secret",
                allowAnonymousHandoff: false,
              },
            },
          } as ParsedAppSettings,
          "test-org-id",
          "test-agent-id",
        ),
      );

      const response = await POST(
        createMockRequest({
          unsignedUserData: undefined,
          signedUserData: undefined,
          email: undefined,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toEqual({
        error: "Missing user data",
      });
    });

    it("should allow requests without user data when anonymous handoff is enabled", async () => {
      // Mock the configuration with anonymous handoff enabled
      vi.mocked(withAppSettings).mockImplementationOnce((req, handler) =>
        handler(
          req,
          {
            branding: {},
            security: {},
            misc: {
              handoffConfiguration: {
                type: "salesforce" as const,
                chatHostUrl: "https://test.salesforce.com",
                chatButtonId: "test-button-id",
                deploymentId: "test-deployment-id",
                orgId: "test-org-id",
                eswLiveAgentDevName: "test-dev-name",
                apiSecret: "test-secret",
                allowAnonymousHandoff: true,
              },
            },
          } as ParsedAppSettings,
          "test-org-id",
          "test-agent-id",
        ),
      );

      const response = await POST(
        createMockRequest({
          unsignedUserData: undefined,
          signedUserData: undefined,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
    });

    it("should handle minimal user data without optional fields", async () => {
      const minimalUser = {
        firstName: "John",
        lastName: "Doe",
        email: "john@example.com",
      };

      const response = await POST(
        createMockRequest({
          unsignedUserData: minimalUser,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      // Verify request doesn't include optional fields
      const fetchCalls = vi.mocked(global.fetch).mock.calls;
      const initRequestBody = JSON.parse(fetchCalls[1][1]?.body as string);
      expect(initRequestBody.prechatDetails).not.toContainEqual(
        expect.objectContaining({
          label: "Location Id",
        }),
      );
      expect(initRequestBody.prechatDetails).not.toContainEqual(
        expect.objectContaining({
          label: "User Id",
        }),
      );
    });

    it("should include optional fields when provided", async () => {
      const fullUser = {
        ...TEST_USER,
        locationId: "test-location",
        userId: "test-user",
        locationType: "test-type",
      };

      const response = await POST(
        createMockRequest({
          unsignedUserData: fullUser,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      // Verify request includes optional fields
      const fetchCalls = vi.mocked(global.fetch).mock.calls;
      const initRequestBody = JSON.parse(fetchCalls[1][1]?.body as string);
      expect(initRequestBody.prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "Location Id",
          value: "test-location",
        }),
      );
      expect(initRequestBody.prechatDetails).toContainEqual(
        expect.objectContaining({
          label: "User Id",
          value: "test-user",
        }),
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle chat session initialization failure with non-OK response", async () => {
      mockFetchResponses({
        chasitorInitResponse: {
          ok: false,
          json: () => Promise.resolve({ error: "Internal Server Error" }),
        },
      });

      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
      expect(console.error).toHaveBeenCalledWith(
        "Failed to initiate chat session",
        expect.any(Object),
      );
    });

    it("should handle fetchChatMessages error", async () => {
      vi.mocked(fetchChatMessages).mockRejectedValueOnce(
        new Error("Failed to fetch messages"),
      );

      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
      expect(console.error).toHaveBeenCalledWith(
        "initiateChatSession failed:",
        expect.any(Error),
      );
    });

    it("should handle sendChatMessage error", async () => {
      // Setup fetchChatMessages to return a ChatRequestSuccess message
      vi.mocked(fetchChatMessages).mockResolvedValueOnce({
        messages: [
          {
            type: SALESFORCE_MESSAGE_TYPES.ChatRequestSuccess,
            message: {
              text: "Test message",
              name: "ChatRequestSuccess",
              schedule: { responseDelayMilliseconds: 0 },
              agentId: "test-agent-id",
            },
          },
        ],
        sequence: 0,
        offset: 0,
      });

      // Make sendChatMessage fail
      vi.mocked(sendChatMessage).mockRejectedValueOnce(
        new Error("Failed to send message"),
      );

      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
      expect(console.error).toHaveBeenCalledWith(
        "initiateChatSession failed:",
        expect.any(Error),
      );
    });

    it("should handle JWT token generation with different payload configurations", async () => {
      const response = await POST(
        createMockRequest({
          unsignedUserData: TEST_USER,
        } as MockRequestParams) as unknown as NextRequest,
      );

      expect(response.status).toBe(200);
      expect(jwt.sign).toHaveBeenCalledWith(
        {
          scope: "appUser",
          sessionId: TEST_DATA.SESSION_ID,
          sessionKey: TEST_DATA.SESSION_KEY,
          affinityToken: TEST_DATA.AFFINITY_TOKEN,
          isAuthenticated: false,
        },
        DEFAULT_SALESFORCE_CONFIG.apiSecret,
        {
          keyid: DEFAULT_SALESFORCE_CONFIG.orgId,
        },
      );
    });
  });
});
