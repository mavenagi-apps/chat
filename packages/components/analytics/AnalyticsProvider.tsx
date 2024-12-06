"use client";

import { type MagiProduct } from "@/lib/analytics/events";
import React, { useEffect } from "react";

import { useAnalytics } from "@/lib/use-analytics";

export function AnalyticsProvider({
  children,
  product,
  userId,
  email,
}: {
  children: React.ReactNode;
  product: MagiProduct;
  userId?: string;
  email?: string;
}) {
  const analytics = useAnalytics();

  useEffect(() => {
    analytics.init(product, userId === "anonymous" ? undefined : userId, email);
  }, [product, userId, analytics, email]);
  return <>{children}</>;
}
