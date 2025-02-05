import { vi } from "vitest";
import { ReactNode } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

/**
 * Example usage of RouterProvider with custom router implementation:
 *
 * const customRouter = {
 *   ...mockRouter,
 *   push: vi.fn().mockImplementation(() => {
 *     // Custom navigation logic
 *   }),
 * };
 *
 * render(
 *   <RouterProvider router={customRouter}>
 *     <YourComponent {...props} />
 *   </RouterProvider>
 * );
 *
 * This helper simplifies Next.js router mocking in tests by:
 * 1. Providing a default mock router with common methods
 * 2. Allowing custom router implementations via the router prop
 * 3. Wrapping components with AppRouterContext for routing functionality
 */

export const mockRouter = {
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  refresh: vi.fn(),
};

type RouterProviderProps = {
  children: ReactNode;
  router?: typeof mockRouter;
};

export function RouterProvider({
  children,
  router = mockRouter,
}: RouterProviderProps) {
  return (
    <AppRouterContext.Provider value={router}>
      {children}
    </AppRouterContext.Provider>
  );
}
