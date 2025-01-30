import { vi } from "vitest";
import { URLPattern as PolyfillURLPattern } from "urlpattern-polyfill";

module.exports = {
  ...(await vi.importActual("next/server")),
  URLPattern: PolyfillURLPattern,
};
