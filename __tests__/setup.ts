import { beforeAll, vi } from "vitest";
import React from "react";
import "@testing-library/jest-dom";
import "vitest-canvas-mock";

// Mock ResizeObserver which isn't available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

vi.mock("next/navigation");
vi.mock("next/server");

beforeAll(() => {
  vi.mock("next/router", () => require("next-router-mock"));
});

// Mock next/image
vi.mock("next/image", () => ({
  default: (props: any) => {
    return React.createElement("img", {
      ...props,
      src: props.src?.src || props.src,
    });
  },
  __esModule: true,
}));

// Mock next-i18next
vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => (key: string) => key,
}));

vi.mock("@/src/lib/analytics/use-analytics", () => ({
  useAnalytics: () => ({
    logEvent: vi.fn(),
  }),
}));

vi.mock("@/src/app/providers/SettingsProvider", () => ({
  useSettings: () => ({
    branding: {
      brandColor: "#000000",
      logo: "https://www.mavenagi-static.com/logos/mavenagi.png",
    },
    security: {},
    misc: {},
  }),
}));
