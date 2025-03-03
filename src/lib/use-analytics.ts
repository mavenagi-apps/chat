import { Analytics } from "@/src/lib/analytics";
import { useState, useEffect } from "react";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import type { MagiProduct, MagiEvent } from "@/src/lib/analytics/events";

export function useAnalytics() {
  const { misc } = useSettings();
  const [analyticsReady, setAnalyticsReady] = useState(false);
  const [logEventsQueue, setLogEventsQueue] = useState<
    { event: MagiEvent; properties: Record<string, any> }[]
  >([]);
  const [initQueue, setInitQueue] = useState<
    {
      product: MagiProduct;
      userId?: string | undefined;
      email?: string | undefined;
    }[]
  >([]);
  const [analytics, setAnalytics] = useState<
    | Analytics
    | {
        logEvent: (event: MagiEvent, properties?: Record<string, any>) => void;
        init: (
          product: MagiProduct,
          userId?: string | undefined,
          email?: string | undefined,
        ) => void;
      }
  >({
    logEvent: (event: MagiEvent, properties?: Record<string, any>) => {
      setLogEventsQueue((prevQueue) => [
        ...prevQueue,
        { event, properties: properties || {} },
      ]);
    },
    init: (
      product: MagiProduct,
      userId?: string | undefined,
      email?: string | undefined,
    ) => {
      setInitQueue((prevQueue) => [...prevQueue, { product, userId, email }]);
    },
  });

  useEffect(() => {
    if (misc.amplitudeApiKey) {
      setAnalytics(Analytics.getInstance(misc.amplitudeApiKey as string));
      setAnalyticsReady(true);
    }
  }, [misc.amplitudeApiKey]);

  useEffect(() => {
    if (analyticsReady) {
      initQueue.forEach(({ product, userId, email }) => {
        analytics.init(product, userId, email);
      });
      setInitQueue([]);

      logEventsQueue.forEach((event) => {
        analytics.logEvent(event.event, event.properties);
      });
      setLogEventsQueue([]);
    }
  }, [analyticsReady]);

  return analytics;
}
