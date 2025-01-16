import clsx from "clsx";
import React, { useEffect, useState } from "react";

import { isBotMessage, ChatMessage, CombinedMessage } from "@/types";
import { useSettings } from "@/app/providers/SettingsProvider";

interface ChatProps {
  messages: CombinedMessage[];
  askFn: (question: string) => Promise<void>;
  initializeHandoff: (data: { email?: string }) => Promise<void>;
  brandColor?: string;
  className?: string;
  agentName: string | null;
  isHandoff: boolean;
  handleEndHandoff: () => Promise<void>;
}

export const ChatContext = React.createContext<{
  followUpQuestions: string[];
  ask: (question: string) => Promise<void>;
  initializeHandoff: (data: { email?: string }) => Promise<
    | void
    | {
        success: true;
        data: {
          [k: string]: FormDataEntryValue;
        };
      }
    | {
        success: false;
        error: string;
      }
  >;
  agentName: string | null;
  isHandoff: boolean;
  handleEndHandoff: () => Promise<void>;
}>({
  followUpQuestions: [],
  ask: async () => {},
  initializeHandoff: async (_data: { email?: string }) => {},
  agentName: null,
  isHandoff: false,
  handleEndHandoff: async () => {},
});

export default function Chat({
  messages,
  askFn,
  initializeHandoff,
  agentName,
  isHandoff,
  handleEndHandoff,
  className,
  children,
}: React.PropsWithChildren<ChatProps>) {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const { brandColor, brandFontColor } = useSettings();
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1];

      if (isBotMessage(lastMsg)) {
        setFollowUpQuestions(lastMsg.metadata?.followupQuestions || []);
        return;
      }
    }
    setFollowUpQuestions([]);
  }, [messages]);

  return (
    <ChatContext.Provider
      value={{
        followUpQuestions,
        ask: askFn,
        initializeHandoff,
        agentName,
        isHandoff,
        handleEndHandoff,
      }}
    >
      <div
        className={clsx(className, "flex w-full flex-1 flex-col overflow-auto")}
        style={{
          // @ts-expect-error css variable
          "--brand-color": brandColor,
          "--brand-font-color": brandFontColor || "#FFFFFF",
        }}
      >
        {children}
      </div>
    </ChatContext.Provider>
  );
}
