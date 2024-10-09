import { Analytics } from '@/lib/analytics';
import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getPublicAppSettings } from '@/app/actions';
import type { MagiProduct, MagiEvent } from '@/lib/analytics/events';

export function useAnalytics() {
  const { orgFriendlyId, id: agentFriendlyId } = useParams();
  const [amplitudeApiKey, setAmplitudeApiKey] = useState<string | null>(null);
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
    console.log('Analytics called');
    console.log(orgFriendlyId, agentFriendlyId);
    const fetchSettings = async () => {
      const publicAppSettings = (await getPublicAppSettings(
        orgFriendlyId as string,
        agentFriendlyId as string
      )) as Partial<AppSettings> & { amplitudeApiKey: string };

      console.log({ publicAppSettings });

      if (publicAppSettings.amplitudeApiKey) {
        setAmplitudeApiKey(publicAppSettings.amplitudeApiKey);
        const analytics = Analytics.getInstance(
          publicAppSettings.amplitudeApiKey
        );
        setAnalytics(analytics);
      }

      if (initQueue.length > 0) {
        initQueue.forEach(({ product, userId, email }) => {
          analytics.init(product, userId, email);
        });
        setInitQueue([]);
      }

      if (logEventsQueue.length > 0) {
        logEventsQueue.forEach((event) => {
          analytics.logEvent(event.event, event.properties);
        });
        setLogEventsQueue([]);
      }
    };

    if (orgFriendlyId && agentFriendlyId && !amplitudeApiKey) {
      fetchSettings()
        .then()
        .catch((error) => {
          console.error('Error fetching settings:', error);
        });
    }
  }, [
    orgFriendlyId,
    agentFriendlyId,
    amplitudeApiKey,
    analytics,
    logEventsQueue,
  ]);

  return analytics;
}