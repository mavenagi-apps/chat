import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";

interface LegacyMessageEvent extends MessageEvent {
  message?: any;
}

enum MAVEN_MESSAGE_TYPES {
  SIGNED_USER_DATA = "SIGNED_USER_DATA",
  UNSIGNED_USER_DATA = "UNSIGNED_USER_DATA",
  CUSTOM_DATA = "CUSTOM_DATA",
  MAVEN_LOADED = "MAVEN_LOADED",
}

const previewUrl = (organizationId: string, agentId: string) =>
  `/preview/${organizationId}/${agentId}`;

export function useIframeMessaging(options?: { disableRedirect?: boolean }) {
  const { disableRedirect = false } = options || {};
  const [loading, setLoading] = useState(true);
  const [signedUserData, setSignedUserData] = useState<string | null>(null);
  const [unsignedUserData, setUnsignedUserData] = useState<Record<
    string,
    any
  > | null>(null);
  const [customData, setCustomData] = useState<Record<string, any> | null>(
    null,
  );
  const {
    organizationId,
    agentId,
  }: { organizationId: string; agentId: string } = useParams();

  const handleMessage = useCallback((event: LegacyMessageEvent) => {
    const key = event.message ? "message" : "data";
    const data = event[key] as MessageEvent["data"];
    if (typeof data !== "object") return;

    switch (data.type) {
      case MAVEN_MESSAGE_TYPES.SIGNED_USER_DATA:
        setSignedUserData(data.data);
        break;
      case MAVEN_MESSAGE_TYPES.UNSIGNED_USER_DATA:
        setUnsignedUserData(data.data);
        break;
      case MAVEN_MESSAGE_TYPES.CUSTOM_DATA:
        setCustomData(data.data);
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

    if (!disableRedirect && !isInIframe()) {
      window.location.href = previewUrl(organizationId, agentId);
      return;
    }

    window.addEventListener("message", handleMessage);
    setLoading(false);

    try {
      parent.postMessage({ type: MAVEN_MESSAGE_TYPES.MAVEN_LOADED }, "*");
    } catch (e) {
      console.error("Error posting MAVEN_LOADED_EVENT", e);
    }

    return () => window.removeEventListener("message", handleMessage);
  }, [organizationId, agentId, handleMessage, disableRedirect]);

  return {
    loading,
    signedUserData,
    unsignedUserData,
    customData,
  };
}
