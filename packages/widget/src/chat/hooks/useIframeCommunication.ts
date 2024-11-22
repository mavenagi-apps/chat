import { useCallback, useEffect, useMemo, useRef, useState } from 'preact/hooks';

export enum MAVEN_MESSAGE_TYPES {
  USER_DATA = 'USER_DATA',
  SIGNED_USER_DATA = 'SIGNED_USER_DATA',
  MAVEN_LOADED = 'MAVEN_LOADED',
}

export type UserData = Record<string, string> | null;
export type UserDataMessage = { 
  type: MAVEN_MESSAGE_TYPES.USER_DATA; 
  data: UserData 
};

export type SignedUserDataMessage = {
  type: MAVEN_MESSAGE_TYPES.SIGNED_USER_DATA;
  data: string;
};

interface LegacyMessageEvent extends MessageEvent {
  message?: any; // Support for older browsers
}

export function useIframeCommunication({
  orgFriendlyId,
  agentFriendlyId,
  userData,
  signedUserData,
  isWide,
  isOpen
}: {
  orgFriendlyId: string,
  agentFriendlyId: string,
  userData: UserData,
  signedUserData?: string | null,
  isWide: boolean,
  isOpen: boolean
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const messageQueue = useRef<(UserDataMessage | SignedUserDataMessage)[]>([]);

  const iframeUrl = useMemo((): string => {
    const currentDomain = window.location.hostname;
    const isLocalEnvironment =
      !currentDomain || ['localhost', '127.0.0.1'].includes(currentDomain);
    const iframeProtocol = isLocalEnvironment ? 'http' : 'https';
    const iframeDomain = isLocalEnvironment
      ? `${currentDomain || 'localhost'}:3000`
      : __IFRAME_DOMAIN__;
    let iframeUrl = `${iframeProtocol}://${iframeDomain}/${orgFriendlyId}/${agentFriendlyId}`;

    return iframeUrl;
  }, [orgFriendlyId, agentFriendlyId]);

  const iframeStyle = useMemo(() => {
    return {
      backgroundColor: 'white',
      width: isWide ? '480px' : '100vw',
      height: isWide ? '560px' : 'calc(100vh - 5rem)',
      position: 'fixed',
      zIndex: 1000,
      bottom: '5rem',
      right: isWide ? '1rem' : 0,
      border: 'solid rgb(209, 213, 219)',
      outline: 'none',
      boxShadow: 'rgba(0, 0, 0, 0.15) 0px 0px 20px 0px',
      borderRadius: isWide ? '12px' : 0,
      transition:
        'transform 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, opacity 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, box-shadow 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s',
      transformOrigin: 'bottom right',
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? 'scale(1)' : 'scale(0)',
    } as React.CSSProperties;
  }, [isWide, isOpen]);

  const postMessageToIframe = useCallback((message: UserDataMessage | SignedUserDataMessage) => {
    if (isLoaded && iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.postMessage(message, '*');
    } else {
      messageQueue.current.push(message);
    }
  }, [isLoaded]);

  useEffect(() => {
    postMessageToIframe({
      type: MAVEN_MESSAGE_TYPES.USER_DATA,
      data: userData,
    });

    if (signedUserData) {
      postMessageToIframe({
        type: MAVEN_MESSAGE_TYPES.SIGNED_USER_DATA,
        data: signedUserData,
      });
    }
  }, [postMessageToIframe]);

  useEffect(() => {
    if (isLoaded && messageQueue.current.length > 0) {
      messageQueue.current.forEach(message =>
        iframeRef.current?.contentWindow?.postMessage(message, '*')
      );
      messageQueue.current = [];
    }
  }, [isLoaded]);

  const handleMessage = useCallback((event: LegacyMessageEvent) => {
    const key = event.message ? 'message' : 'data';
    const data = event[key] as MessageEvent['data'];
    if (typeof data !== 'object') return;

    if (data.type === MAVEN_MESSAGE_TYPES.MAVEN_LOADED) {
      if (isLoaded) return;
      setIsLoaded(true);
    }
  }, [isLoaded]);

  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleMessage]);

  return {
    iframeRef,
    iframeUrl,
    iframeStyle
  };
} 