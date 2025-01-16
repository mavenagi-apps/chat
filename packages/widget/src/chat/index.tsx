import { createRef, render } from "preact";
import { forwardRef, useImperativeHandle } from "preact/compat";
import { useEffect, useState } from "preact/hooks";
import { ChatButton } from "./components/ChatButton";
import { useIframeCommunication } from "./hooks/useIframeCommunication";

export const useMediaQuery = (query: string) => {
  const mediaMatch = window.matchMedia(query);
  const [matches, setMatches] = useState(mediaMatch.matches);

  useEffect(() => {
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mediaMatch.addEventListener("change", handler);
    return () => mediaMatch.removeEventListener("change", handler);
  }, []);
  return matches;
};

type Props = {
  iframeUrl: string;
  bgColor: string;
  textColor: string;
  horizontalPosition: "left" | "right";
  verticalPosition: "top" | "bottom";
  signedUserData?: string | null;
  unsignedUserData?: Record<string, any> | null;
  unverifiedUserData?: Record<string, any> | null;
  customData?: Record<string, any> | null;
  organizationId: string;
  agentId: string;
};

const App = forwardRef<{ open: () => void; close: () => void }, Props>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const isWide = useMediaQuery("(min-width: 500px)");
    const { iframeRef, iframeUrl, iframeStyle } = useIframeCommunication({
      organizationId: props.organizationId,
      agentId: props.agentId,
      signedUserData: props.signedUserData,
      unsignedUserData: props.unsignedUserData || props.unverifiedUserData,
      customData: props.customData,
      isWide,
      isOpen,
    });

    useImperativeHandle(ref, () => ({
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    return (
      <>
        <ChatButton
          bgColor={props.bgColor}
          textColor={props.textColor}
          horizontalPosition={props.horizontalPosition}
          verticalPosition={props.verticalPosition}
          isOpen={isOpen}
          onClick={() => setIsOpen(!isOpen)}
        />
        <iframe
          ref={iframeRef}
          style={iframeStyle}
          src={iframeUrl}
          allow="clipboard-write"
        />
      </>
    );
  },
);

const appRef = createRef();

export function open() {
  appRef.current?.open();
}

export function close() {
  appRef.current?.close();
}

type LoadProps = Partial<Omit<Props, "iframeUrl">> & {
  envPrefix?: string;
  apiKey: string;
} & // This union type ensures backwards compatibility during the migration from the
  // "orgFriendlyId" and "agentFriendlyId" to "organizationId" and "agentId".
  // It enforces that either:
  // 1. Both organizationId and agentId are provided (new spec) OR
  // 2. Both orgFriendlyId and agentFriendlyId are provided (legacy spec)
  // This prevents mixing of old and new ID formats while supporting both patterns
  (| {
        organizationId: string;
        agentId: string;
        orgFriendlyId?: never;
        agentFriendlyId?: never;
      }
    | {
        orgFriendlyId: string;
        agentFriendlyId: string;
        organizationId?: never;
        agentId?: never;
      }
  );

export async function load({
  envPrefix: _envPrefix,
  bgColor,
  textColor = "white",
  horizontalPosition = "right",
  verticalPosition = "bottom",
  organizationId,
  orgFriendlyId,
  agentId,
  agentFriendlyId,
  signedUserData = null,
  unsignedUserData = null,
  customData = null,
}: LoadProps) {
  const placeholder = document.createElement("div");
  placeholder.id = "maven-chat-widget";
  document.body.appendChild(placeholder);

  render(
    // @ts-expect-error Server Component
    <App
      ref={appRef}
      bgColor={bgColor || "#6C2BD9"}
      textColor={textColor}
      horizontalPosition={horizontalPosition}
      verticalPosition={verticalPosition}
      signedUserData={signedUserData}
      unsignedUserData={unsignedUserData}
      customData={customData}
      // This fallback is to support the legacy spec
      // TODO: Remove this fallback once the legacy spec is deprecated
      organizationId={organizationId || orgFriendlyId || ""}
      agentId={agentId || agentFriendlyId || ""}
    />,
    placeholder,
  );
}
