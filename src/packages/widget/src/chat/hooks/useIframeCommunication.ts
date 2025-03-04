import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "preact/hooks";

// Position constants
const POSITION = {
  LEFT: "left",
  RIGHT: "right",
  TOP: "top",
  BOTTOM: "bottom",
  AUTO: "auto",
  FIXED: "fixed",
};

// Spacing constants
const SPACING = {
  WIDE_MARGIN: "1rem",
  ZERO: 0,
  VERTICAL_MARGIN: "5rem",
};

// Style constants
const STYLE = {
  BACKGROUND_COLOR: "white",
  WIDE_WIDTH: "480px",
  FULL_WIDTH: "100vw",
  WIDE_HEIGHT: "560px",
  FULL_HEIGHT: "calc(100vh - 5rem)",
  Z_INDEX: 1000,
  BORDER: "solid rgb(209, 213, 219)",
  OUTLINE: "none",
  BOX_SHADOW: "rgba(0, 0, 0, 0.15) 0px 0px 20px 0px",
  WIDE_BORDER_RADIUS: "12px",
  ZERO_BORDER_RADIUS: 0,
  TRANSITION:
    "transform 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, opacity 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s, box-shadow 0.2s cubic-bezier(0.03, 0.18, 0.32, 0.66) 0s",
  VISIBLE_OPACITY: 1,
  HIDDEN_OPACITY: 0,
  VISIBLE_SCALE: "scale(1)",
  HIDDEN_SCALE: "scale(0)",
};

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
  locale,
  horizontalPosition,
  verticalPosition,
}: {
  organizationId: string;
  agentId: string;
  signedUserData?: string | null;
  unsignedUserData?: Record<string, any> | null;
  customData?: Record<string, any> | null;
  isWide: boolean;
  isOpen: boolean;
  locale?: string;
  horizontalPosition: "left" | "right";
  verticalPosition: "top" | "bottom";
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

    if (locale) {
      iframeUrl += `?locale=${locale}`;
    }

    return iframeUrl;
  }, [organizationId, agentId]);

  const iframeStyle = useMemo(() => {
    // Determine position based on horizontalPosition and verticalPosition
    const positionStyles: React.CSSProperties = {};

    // Set horizontal position (left or right)
    if (horizontalPosition === POSITION.LEFT) {
      positionStyles.left = isWide ? SPACING.WIDE_MARGIN : SPACING.ZERO;
      positionStyles.right = POSITION.AUTO;
      // Update transform origin for left positioning
      positionStyles.transformOrigin = `${verticalPosition} ${POSITION.LEFT}`;
    } else {
      positionStyles.right = isWide ? SPACING.WIDE_MARGIN : SPACING.ZERO;
      positionStyles.left = POSITION.AUTO;
      // Update transform origin for right positioning
      positionStyles.transformOrigin = `${verticalPosition} ${POSITION.RIGHT}`;
    }

    // Set vertical position (top or bottom)
    if (verticalPosition === POSITION.TOP) {
      positionStyles.top = SPACING.VERTICAL_MARGIN;
      positionStyles.bottom = POSITION.AUTO;
    } else {
      positionStyles.bottom = SPACING.VERTICAL_MARGIN;
      positionStyles.top = POSITION.AUTO;
    }

    return {
      backgroundColor: STYLE.BACKGROUND_COLOR,
      width: isWide ? STYLE.WIDE_WIDTH : STYLE.FULL_WIDTH,
      height: isWide ? STYLE.WIDE_HEIGHT : STYLE.FULL_HEIGHT,
      position: POSITION.FIXED,
      zIndex: STYLE.Z_INDEX,
      border: STYLE.BORDER,
      outline: STYLE.OUTLINE,
      boxShadow: STYLE.BOX_SHADOW,
      borderRadius: isWide
        ? STYLE.WIDE_BORDER_RADIUS
        : STYLE.ZERO_BORDER_RADIUS,
      transition: STYLE.TRANSITION,
      opacity: isOpen ? STYLE.VISIBLE_OPACITY : STYLE.HIDDEN_OPACITY,
      transform: isOpen ? STYLE.VISIBLE_SCALE : STYLE.HIDDEN_SCALE,
      ...positionStyles,
    } as React.CSSProperties;
  }, [isWide, isOpen, horizontalPosition, verticalPosition]);

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
