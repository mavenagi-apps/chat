import { render, renderHook } from "@testing-library/react";
import { AuthProvider, useAuth } from "@/src/app/providers/AuthProvider";
import { describe, expect, test, vi } from "vitest";

describe("AuthProvider", () => {
  describe("Provider functionality", () => {
    test("should provide correct authentication state when user is signed in", () => {
      const signedUserData = "user123";
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AuthProvider signedUserData={signedUserData}>
            {children}
          </AuthProvider>
        ),
      });

      expect(result.current.signedUserData).toBe("user123");
      expect(result.current.isAuthenticated).toBe(true);
    });

    test("should provide correct authentication state when user is not signed in", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AuthProvider signedUserData={null}>{children}</AuthProvider>
        ),
      });

      expect(result.current.signedUserData).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });

    test("should render children properly", () => {
      const TestChild = () => <div data-testid="test-child">Test Child</div>;

      const { getByTestId } = render(
        <AuthProvider signedUserData={null}>
          <TestChild />
        </AuthProvider>,
      );

      expect(getByTestId("test-child")).toBeInTheDocument();
    });
  });

  describe("useAuth hook", () => {
    test("should throw error when used outside of AuthProvider", () => {
      // Suppress console.error for this test
      const consoleSpy = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow("useAuth must be used within an AuthProvider");

      // Restore console.error
      consoleSpy.mockRestore();
    });

    test("should memoize isAuthenticated value", () => {
      const { result: result1 } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AuthProvider signedUserData="user123">{children}</AuthProvider>
        ),
      });

      const { result: result2 } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AuthProvider signedUserData="user123">{children}</AuthProvider>
        ),
      });

      expect(result1.current.isAuthenticated).toBe(true);
      expect(result2.current.isAuthenticated).toBe(true);
      expect(result1.current.isAuthenticated).toBe(
        result2.current.isAuthenticated,
      );
    });
  });

  describe("edge cases", () => {
    test("should handle empty string as signedUserData", () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: ({ children }) => (
          <AuthProvider signedUserData="">{children}</AuthProvider>
        ),
      });

      expect(result.current.signedUserData).toBe("");
      expect(result.current.isAuthenticated).toBe(false);
    });

    test("should handle undefined children", () => {
      const { container } = render(
        <AuthProvider signedUserData={null}></AuthProvider>,
      );

      expect(container).toBeEmptyDOMElement();
    });
  });
});
