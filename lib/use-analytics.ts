import { Analytics } from '@/lib/analytics';
import { useState, useEffect } from 'react';
import { useSettings } from '@/app/providers/SettingsProvider';
import type { MagiProduct, MagiEvent } from '@/lib/analytics/events';

export function useAnalytics() {
  const { amplitudeApiKey } = useSettings();
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
          email?: string | undefined
        ) => void;
      }
  >({
    logEvent: (event: MagiEvent, properties?: Record<string, any>) => {
      console.log('Analytics called before API key set');
      setLogEventsQueue((prevQueue) => [
        ...prevQueue,
        { event, properties: properties || {} },
      ]);
    },
    init: (
      product: MagiProduct,
      userId?: string | undefined,
      email?: string | undefined
    ) => {
      console.log('Analytics called before API key set');
      setInitQueue((prevQueue) => [...prevQueue, { product, userId, email }]);
    },
  });

  useEffect(() => {
    if (amplitudeApiKey) {
      setAnalytics(Analytics.getInstance(amplitudeApiKey));
      setAnalyticsReady(true);
    }
  }, [amplitudeApiKey]);

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