import { useCallback, useRef } from "react";

export function useScrollToLatest() {
  const latestChatBubbleRef = useRef<HTMLDivElement>(null);
  return {
    scrollToLatest: useCallback(() => {
      setTimeout(
        () =>
          latestChatBubbleRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
            inline: "nearest",
          }),
        100,
      );
    }, []),
    latestChatBubbleRef,
  };
}
