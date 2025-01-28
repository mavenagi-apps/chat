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
import { withAppSettings } from "@/app/api/server/utils";
import { sendChatMessage } from "@/app/api/salesforce/utils";

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
        handoffConfiguration: {
          type: "salesforce",
          chatHostUrl: "https://test.salesforce.com",
          chatButtonId: "test-button-id",
          deploymentId: "test-deployment-id",
          orgId: "test-org-id",
          eswLiveAgentDevName: "test-dev-name",
          apiSecret: "test-secret",
        },
      },
      "test-org-id",
      "test-agent-id",
    ),
  ),
}));

vi.mock("@/app/api/salesforce/utils", async () => {
  const actual = await vi.importActual("@/app/api/salesforce/utils");
  return {
    ...(actual as object),
    sendChatMessage: vi.fn(),
  };
});

describe("POST /api/salesforce/conversations", () => {
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
    userAgent: "test-user-agent",
    screenResolution: "1920x1080",
    language: "en-US",
  };

  // Helper to create mock request
  const createMockRequest = ({
    messages = [TEST_DATA.DEFAULT_MESSAGE],
    unsignedUserData = TEST_USER,
    headers = {} as Record<string, string>,
  } = {}) => ({
    json: vi.fn().mockResolvedValue({
      messages,
      unsignedUserData,
      userAgent: TEST_USER.userAgent,
      screenResolution: TEST_USER.screenResolution,
      language: TEST_USER.language,
    }),
    headers: {
      get: vi.fn().mockImplementation((key) => headers[key]),
    },
  });

  // Mock fetch responses
  const mockFetchResponses = () => {
    global.fetch = vi.fn().mockImplementation((url) => {
      if (url.includes("/SessionId")) {
        return Promise.resolve({
          ok: true,
          json: () =>
            Promise.resolve({
              id: TEST_DATA.SESSION_ID,
              key: TEST_DATA.SESSION_KEY,
              affinityToken: TEST_DATA.AFFINITY_TOKEN,
            }),
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({}),
      });
    });
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockFetchResponses();
    vi.mocked(jwt.sign).mockReturnValue(TEST_DATA.JWT_TOKEN);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration Validation", () => {
    it("should return 400 when handoff configuration type is invalid", async () => {
      vi.mocked(withAppSettings).mockImplementationOnce((req, handler) =>
        handler(
          req,
          {
            handoffConfiguration: {
              // @ts-expect-error - invalid type
              type: "invalid",
            },
          },
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
        error: "Invalid handoff configuration type. Expected 'salesforce'.",
      });
    });
  });

  describe("Chat Session Initialization", () => {
    it("should successfully initialize a chat session", async () => {
      const response = await POST(
        createMockRequest() as unknown as NextRequest,
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
      global.fetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: false,
          status: 500,
        }),
      );

      const response = await POST(
        createMockRequest() as unknown as NextRequest,
      );

      expect(response.status).toBe(500);
      expect(await response.json()).toEqual({
        error: "Internal Server Error",
      });
    });

    it("includes originalReferrer in session init when present", async () => {
      const mockReferrer = "https://example.com/page";
      const request = createMockRequest({
        headers: { referer: mockReferrer },
      }) as unknown as NextRequest;

      await POST(request);

      const initCall = (global.fetch as Mock).mock.calls.find((call) =>
        call[0].includes("/ChasitorInit"),
      );
      const requestBody = JSON.parse(initCall?.[1]?.body);
      expect(requestBody.visitorInfo?.originalReferrer).toBe(mockReferrer);
    });

    it("handles missing referrer header gracefully", async () => {
      const request = createMockRequest();

      await POST(request as unknown as NextRequest);

      const initCall = (global.fetch as Mock).mock.calls.find((call) =>
        call[0].includes("/ChasitorInit"),
      );
      const requestBody = JSON.parse(initCall?.[1]?.body);
      expect(requestBody.visitorInfo?.originalReferrer).toBe("unknown");
    });
  });

  describe("Message Handling", () => {
    it("should send initial messages after session creation", async () => {
      await POST(createMockRequest() as unknown as NextRequest);

      expect(sendChatMessage).toHaveBeenCalled();
      expect(vi.mocked(sendChatMessage).mock.calls[0][0]).toContain(
        "MAVEN TRANSCRIPT HISTORY",
      );
    });
  });
});
