import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";

enum MAVEN_MESSAGE_TYPES {
  USER_DATA = "USER_DATA",
  SIGNED_USER_DATA = "SIGNED_USER_DATA",
  UNSIGNED_USER_DATA = "UNSIGNED_USER_DATA",
  CUSTOM_DATA = "CUSTOM_DATA",
  MAVEN_LOADED = "MAVEN_LOADED",
}

type SignedUserDataMessage = {
  type: MAVEN_MESSAGE_TYPES.SIGNED_USER_DATA;
  data: string;
};

type UnsignedUserDataMessage = {
  type: MAVEN_MESSAGE_TYPES.UNSIGNED_USER_DATA;
  data: Record<string, any>;
};

type CustomDataMessage = {
  type: MAVEN_MESSAGE_TYPES.CUSTOM_DATA;
  data: Record<string, any>;
};

interface LegacyMessageEvent extends MessageEvent {
  message?: any; // Support for older browsers
}

export function useIframeCommunication({
  organizationId,
  agentId,
  signedUserData,
  unsignedUserData,
  customData,
  isWide,
  isOpen,
}: {
  organizationId: string;
  agentId: string;
  signedUserData?: string | null;
  unsignedUserData?: Record<string, any> | null;
  customData?: Record<string, any> | null;
  isWide: boolean;
  isOpen: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const messageQueue = useRef<
    (SignedUserDataMessage | UnsignedUserDataMessage | CustomDataMessage)[]
  >([]);

  const iframeUrl = useMemo((): string => {
    const currentDomain = window.location.hostname;
    const isLocalEnvironment =
      !currentDomain || ["localhost", "127.0.0.1"].includes(currentDomain);
    const iframeProtocol = isLocalEnvironment ? "http" : "https";
    const iframeDomain = isLocalEnvironment
      ? `${currentDomain || "localhost"}:${window.location.port}`
      : __IFRAME_DOMAIN__;
    let iframeUrl = `${iframeProtocol}://${iframeDomain}/${organizationId}/${agentId}`;

    return iframeUrl;
  }, [organizationId, agentId]);

  const iframeStyle = useMemo(() => {
    return {
      backgroundColor: "white",
      width: isWide ? "480px" : "100vw",
      height: isWide ? "560px" : "calc(100vh - 5rem)",
      position: "fixed",
      zIndex: 1000,
      bottom: "5rem",
      right: isWide ? "1rem" : 0,
      border: "solid rgb(209, 213, 219)",
      outline: "none",
      boxShadow: "rgba(0, 0, 0, 0.15) 0px 0px 20px 0px",
      borderRadius: isWide ? "12px" : 0,
      transition:
        "transform 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, opacity 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, box-shadow 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s",
      transformOrigin: "bottom right",
      opacity: isOpen ? 1 : 0,
      transform: isOpen ? "scale(1)" : "scale(0)",
    } as React.CSSProperties;
  }, [isWide, isOpen]);

  const postMessageToIframe = useCallback(
    (
      message:
        | SignedUserDataMessage
        | UnsignedUserDataMessage
        | CustomDataMessage,
    ) => {
      if (isLoaded && iframeRef.current?.contentWindow) {
        iframeRef.current.contentWindow.postMessage(message, "*");
      } else {
        messageQueue.current.push(message);
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    const messages = [
      {
        type: MAVEN_MESSAGE_TYPES.SIGNED_USER_DATA,
        data: signedUserData,
      },
      {
        type: MAVEN_MESSAGE_TYPES.UNSIGNED_USER_DATA,
        data: unsignedUserData,
      },
      {
        type: MAVEN_MESSAGE_TYPES.CUSTOM_DATA,
        data: customData,
      },
    ];

    messages.forEach((message) => {
      if (message.data) {
        postMessageToIframe(
          message as
            | SignedUserDataMessage
            | UnsignedUserDataMessage
            | CustomDataMessage,
        );
      }
    });
  }, [postMessageToIframe]);

  useEffect(() => {
    if (isLoaded && messageQueue.current.length > 0) {
      messageQueue.current.forEach((message) =>
        iframeRef.current?.contentWindow?.postMessage(message, "*"),
      );
      messageQueue.current = [];
    }
  }, [isLoaded]);

  const handleMessage = useCallback(
    (event: LegacyMessageEvent) => {
      const key = event.message ? "message" : "data";
      const data = event[key] as MessageEvent["data"];
      if (typeof data !== "object") return;

      if (data.type === MAVEN_MESSAGE_TYPES.MAVEN_LOADED) {
        if (isLoaded) return;
        setIsLoaded(true);
      }
    },
    [isLoaded],
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return {
    iframeRef,
    iframeUrl,
    iframeStyle,
  };
}
