"use client";

import { AnalyticsProvider } from "@/src/packages/components/analytics/AnalyticsProvider";
import { MagiProduct } from "@/src/lib/analytics/events";
import { SettingsProvider } from "@/src/app/providers/SettingsProvider";

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SettingsProvider>
      <AnalyticsProvider product={MagiProduct.chat}>
        {children}
      </AnalyticsProvider>
    </SettingsProvider>
  );
}
