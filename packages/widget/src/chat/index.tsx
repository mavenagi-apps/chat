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
  orgFriendlyId: string;
  agentFriendlyId: string;
};
const App = forwardRef<{ open: () => void; close: () => void }, Props>(
  (props, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const isWide = useMediaQuery("(min-width: 500px)");
    const { iframeRef, iframeUrl, iframeStyle } = useIframeCommunication({
      orgFriendlyId: props.orgFriendlyId,
      agentFriendlyId: props.agentFriendlyId,
      signedUserData: props.signedUserData,
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

export async function load({
  envPrefix: _envPrefix,
  bgColor,
  textColor = "white",
  horizontalPosition = "right",
  verticalPosition = "bottom",
  orgFriendlyId,
  agentFriendlyId,
  signedUserData = null,
}: Partial<Omit<Props, "agentId" | "baseUrl">> & {
  envPrefix?: string;
  apiKey: string;
  horizontalPosition?: "left" | "right";
  verticalPosition?: "top" | "bottom";
  orgFriendlyId: string;
  agentFriendlyId: string;
  signedUserData?: string | null;
}) {
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
      orgFriendlyId={orgFriendlyId}
      agentFriendlyId={agentFriendlyId}
    />,
    placeholder,
  );
}
