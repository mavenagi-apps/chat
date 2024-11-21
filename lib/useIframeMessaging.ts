import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface LegacyMessageEvent extends MessageEvent {
  message?: any;
}

const USER_DATA_EVENT = 'USER_DATA';
const MAVEN_LOADED_EVENT = 'MAVEN_LOADED';
const demoUrl = (orgFriendlyId: string, agentFriendlyId: string) =>
  `/demo/${orgFriendlyId}/${agentFriendlyId}`;

export function useIframeMessaging() {
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<Record<string, string> | null>(null);
  const {
    orgFriendlyId,
    id: agentFriendlyId,
  }: { orgFriendlyId: string; id: string } = useParams();

  const handleMessage = useCallback((event: LegacyMessageEvent) => {
    const key = event.message ? 'message' : 'data';
    const data = event[key] as MessageEvent['data'];
    if (typeof data !== 'object') return;

    if (data.type === USER_DATA_EVENT) {
      setUserData(data.data);
    }
  }, []);

  useEffect(() => {
    const isInIframe = () => {
      try {
        return window.self !== window.top;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (e) {
        return true;
      }
    };

    if (!isInIframe()) {
      window.location.href = demoUrl(orgFriendlyId, agentFriendlyId);
      return;
    }

    window.addEventListener('message', handleMessage);
    setLoading(false);

    try {
      parent.postMessage({ type: MAVEN_LOADED_EVENT }, '*');
    } catch (e) {
      console.error('Error posting MAVEN_LOADED_EVENT', e);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [orgFriendlyId, agentFriendlyId, handleMessage]);

  return {
    loading,
    userData,
  };
}
