import { renderHook, act } from "@testing-library/react";
import {
  describe,
  expect,
  test,
  vi,
  beforeEach,
  afterEach,
  type Mock,
} from "vitest";
import { useIframeMessaging } from "@/lib/useIframeMessaging";

// Mock search params value for testing
let mockDisableRedirectValue: string | null = null;

vi.mock("next/navigation", () => ({
  useParams: () => ({
    organizationId: "test-org",
    agentId: "test-agent",
  }),
  useSearchParams: () => ({
    get: (key: string) =>
      key === "disableRedirect" ? mockDisableRedirectValue : null,
  }),
}));

describe("useIframeMessaging", () => {
  const originalWindow = global.window;
  let mockPostMessage: Mock;

  const createMockWindow = (isIframe = false) => {
    const mockWindow = {
      ...originalWindow,
      parent: {
        postMessage: mockPostMessage,
      },
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      location: {
        href: "",
      },
    };

    if (isIframe) {
      // For iframe environment, self and top should be different objects
      Object.defineProperty(mockWindow, "self", {
        value: {},
        writable: true,
      });
      Object.defineProperty(mockWindow, "top", {
        value: { some: "other-value" },
        writable: true,
      });
    } else {
      // For non-iframe environment, self and top should reference the same object
      Object.defineProperty(mockWindow, "self", {
        value: mockWindow,
        writable: true,
      });
      Object.defineProperty(mockWindow, "top", {
        value: mockWindow,
        writable: true,
      });
    }

    return mockWindow;
  };

  const setupWindow = (isIframe = false) => {
    Object.defineProperty(global, "window", {
      value: createMockWindow(isIframe),
      writable: true,
    });
  };

  beforeEach(() => {
    mockPostMessage = vi.fn();
    mockDisableRedirectValue = null;
    setupWindow();
  });

  afterEach(() => {
    Object.defineProperty(global, "window", {
      value: originalWindow,
      writable: true,
    });
    vi.clearAllMocks();
  });

  describe("disableRedirect behavior", () => {
    const testCases = [
      { param: "true", expected: true, description: "param is 'true'" },
      { param: "", expected: true, description: "param is empty string" },
      {
        param: "anything",
        expected: true,
        description: "param is any non-false value",
      },
      { param: null, expected: false, description: "param is not present" },
      { param: "false", expected: false, description: "param is 'false'" },
    ];

    testCases.forEach(({ param, expected, description }) => {
      test(`should handle disableRedirect when ${description}`, () => {
        mockDisableRedirectValue = param;
        renderHook(() => useIframeMessaging());

        if (expected) {
          expect(window.location.href).toBe("/preview/test-org/test-agent");
        } else {
          expect(window.location.href).not.toBe("");
        }
      });
    });
  });

  describe("message handling", () => {
    beforeEach(() => {
      setupWindow(true);
    });

    const messageTypes = [
      {
        type: "SIGNED_USER_DATA",
        data: "test-signed-data",
        resultKey: "signedUserData" as const,
        expected: "test-signed-data",
      },
      {
        type: "UNSIGNED_USER_DATA",
        data: { id: "test-id" },
        resultKey: "unsignedUserData" as const,
        expected: { id: "test-id" },
      },
      {
        type: "CUSTOM_DATA",
        data: { custom: "data" },
        resultKey: "customData" as const,
        expected: { custom: "data" },
      },
    ];

    messageTypes.forEach(({ type, data, resultKey, expected }) => {
      test(`should handle ${type} message`, () => {
        const { result } = renderHook(() => useIframeMessaging());

        const mockMessageEvent = { data: { type, data } };

        const addEventListener = vi.mocked(window.addEventListener);
        expect(addEventListener).toHaveBeenCalledWith(
          "message",
          expect.any(Function),
        );
        const messageHandler = addEventListener.mock.calls[0][1] as Function;

        act(() => {
          messageHandler(mockMessageEvent);
        });

        expect(result.current[resultKey]).toEqual(expected);
      });
    });
  });

  test("should cleanup event listener on unmount", () => {
    setupWindow(true);
    const { unmount } = renderHook(() => useIframeMessaging());

    const addEventListener = vi.mocked(window.addEventListener);
    expect(addEventListener).toHaveBeenCalledWith(
      "message",
      expect.any(Function),
    );
    const messageHandler = addEventListener.mock.calls[0][1];

    unmount();

    expect(window.removeEventListener).toHaveBeenCalledWith(
      "message",
      messageHandler,
    );
  });
});
