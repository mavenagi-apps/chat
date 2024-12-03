import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';

interface LegacyMessageEvent extends MessageEvent {
  message?: any;
}

enum MAVEN_MESSAGE_TYPES {
  SIGNED_USER_DATA = 'SIGNED_USER_DATA',
  MAVEN_LOADED = 'MAVEN_LOADED',
}

const demoUrl = (orgFriendlyId: string, agentFriendlyId: string) =>
  `/demo/${orgFriendlyId}/${agentFriendlyId}`;

export function useIframeMessaging() {
  const [loading, setLoading] = useState(true);
  const [signedUserData, setSignedUserData] = useState<string | null>(null);
  const {
    orgFriendlyId,
    id: agentFriendlyId,
  }: { orgFriendlyId: string; id: string } = useParams();

  const handleMessage = useCallback((event: LegacyMessageEvent) => {
    const key = event.message ? 'message' : 'data';
    const data = event[key] as MessageEvent['data'];
    if (typeof data !== 'object') return;

    switch (data.type) {
      case MAVEN_MESSAGE_TYPES.SIGNED_USER_DATA:
        setSignedUserData(data.data);
        break;
      default:
        break;
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
      parent.postMessage({ type: MAVEN_MESSAGE_TYPES.MAVEN_LOADED }, '*');
    } catch (e) {
      console.error('Error posting MAVEN_LOADED_EVENT', e);
    }

    return () => window.removeEventListener('message', handleMessage);
  }, [orgFriendlyId, agentFriendlyId, handleMessage]);

  return {
    loading,
    signedUserData,
  };
}
