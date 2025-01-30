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

vi.mock("@/lib/analytics/use-analytics", () => ({
  useAnalytics: () => ({
    logEvent: vi.fn(),
  }),
}));

vi.mock("@/app/providers/SettingsProvider", () => ({
  useSettings: () => ({
    brandColor: "#000000",
    logoUrl: "https://www.mavenagi-static.com/logos/mavenagi.png",
  }),
}));
