import { vi } from "vitest";
import { ReactNode } from "react";
import { AppRouterContext } from "next/dist/shared/lib/app-router-context.shared-runtime";

// const customRouter = {
//   ...mockRouter,
//   push: vi.fn().mockImplementation(() => { /* custom implementation */ }),
// };

// render(
//   <RouterProvider router={customRouter}>
//     <YourComponent {...props} />
//   </RouterProvider>
// );

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
