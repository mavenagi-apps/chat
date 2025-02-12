import { vi, describe, it, expect, beforeEach } from "vitest";
import { NEXT_LOCALE_HEADER } from "@/app/constants/internationalization";
import { getRequestConfigHandler } from "@/i18n";

// Mock next/headers
const headerMap = new Map<string, string>();

vi.mock("next/headers", () => ({
  headers: () => ({
    get: (key: string) => headerMap.get(key),
  }),
}));

// Mock message files
vi.mock("@/messages/en.json", () => ({
  default: { test: "Test Message" },
}));

vi.mock("@/messages/es.json", () => ({
  default: { test: "Mensaje de Prueba" },
}));

// Mock fr.json to simulate it not existing
vi.mock("@/messages/fr.json", () => ({
  default: null,
}));

// Mock de.json to simulate it not existing
vi.mock("@/messages/de.json", () => ({
  default: null,
}));

describe("i18n configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    headerMap.clear();
  });

  it("should handle basic locale configuration", async () => {
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("en"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "en",
        messages: expect.objectContaining({ test: "Test Message" }),
      }),
    );
  });

  it("should support Spanish locale", async () => {
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("es"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "es",
        messages: expect.objectContaining({ test: "Mensaje de Prueba" }),
      }),
    );
  });

  it("should normalize locale codes to base locale", async () => {
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("en-US"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "en",
        messages: expect.objectContaining({ test: "Test Message" }),
      }),
    );
  });

  it("should fall back to English for unsupported locales", async () => {
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("fr"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "en",
        messages: expect.objectContaining({ test: "Test Message" }),
      }),
    );
  });

  it("should handle invalid locale gracefully", async () => {
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("invalid"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "en",
        messages: expect.objectContaining({ test: "Test Message" }),
      }),
    );
  });

  it("should respect locale from URL header", async () => {
    headerMap.set(NEXT_LOCALE_HEADER, "es");
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("en"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "es",
        messages: expect.objectContaining({ test: "Mensaje de Prueba" }),
      }),
    );
  });

  it("should handle accept-language header", async () => {
    headerMap.set("accept-language", "es-ES,es;q=0.9,en;q=0.8");
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("en"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "es",
        messages: expect.objectContaining({ test: "Mensaje de Prueba" }),
      }),
    );
  });

  it("should prioritize URL locale over accept-language", async () => {
    headerMap.set(NEXT_LOCALE_HEADER, "en");
    headerMap.set("accept-language", "es-ES,es;q=0.9,en;q=0.8");
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("es"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "en",
        messages: expect.objectContaining({ test: "Test Message" }),
      }),
    );
  });

  it("should handle complex accept-language headers", async () => {
    headerMap.set("accept-language", "fr-FR,fr;q=0.9,es;q=0.8,en;q=0.7");
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("en"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "es",
        messages: expect.objectContaining({ test: "Mensaje de Prueba" }),
      }),
    );
  });

  it("should fall back to English for unsupported accept-language locales", async () => {
    headerMap.set("accept-language", "fr-FR,fr;q=0.9,de;q=0.8");
    const config = await getRequestConfigHandler({
      requestLocale: Promise.resolve("en"),
    });
    expect(config).toEqual(
      expect.objectContaining({
        locale: "en",
        messages: expect.objectContaining({ test: "Test Message" }),
      }),
    );
  });
});
