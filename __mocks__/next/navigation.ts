import { vi } from "vitest";

const useRouter = vi.fn(() => ({
  push: vi.fn(),
  replace: vi.fn(),
  prefetch: vi.fn(),
}));

const useParams = vi.fn(() => ({
  organizationId: "test-org",
  agentId: "test-id",
}));

const usePathname = vi.fn(() => "/");

const useSearchParams = vi.fn(() => ({
  get: vi.fn(),
  getAll: vi.fn(),
}));

module.exports = {
  ...(await vi.importActual("next/navigation")),
  useRouter,
  useParams,
  usePathname,
  useSearchParams,
};
