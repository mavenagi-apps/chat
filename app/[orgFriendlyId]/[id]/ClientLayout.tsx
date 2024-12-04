"use client";

import { AnalyticsProvider } from "@/packages/components/analytics/AnalyticsProvider";
import { MagiProduct } from "@/lib/analytics/events";
import { SettingsProvider } from "@/app/providers/SettingsProvider";

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
