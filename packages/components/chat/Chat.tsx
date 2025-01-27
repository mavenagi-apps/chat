import clsx from "clsx";
import React, { useEffect, useState } from "react";

import { isBotMessage, ChatMessage, CombinedMessage } from "@/types";
import { useSettings } from "@/app/providers/SettingsProvider";
import { Attachment } from "mavenagi/api";
import type { Front } from "@/types/front";
import { useIdleMessage } from "@/lib/useIdleMessage";

interface ChatContextProps {
  addMessage: (message: ChatMessage) => void;
  agentName: string | null;
  ask: (question: string, attachments?: Attachment[]) => Promise<void>;
  conversationId: string;
  followUpQuestions: string[];
  handleEndHandoff: () => Promise<void>;
  initializeHandoff: (data: { email?: string }) => Promise<
    | void
    | {
        success: true;
        data: { [k: string]: FormDataEntryValue };
      }
    | {
        success: false;
        error: string;
      }
  >;
  isHandoff: boolean;
  messages: CombinedMessage[];
  shouldSupressHandoffInputDisplay: boolean;
}

interface ChatProps extends Omit<ChatContextProps, "followUpQuestions"> {
  brandColor?: string;
  className?: string;
}

export const ChatContext = React.createContext<ChatContextProps>({
  addMessage: () => {},
  agentName: null,
  ask: async () => {},
  conversationId: "",
  followUpQuestions: [],
  handleEndHandoff: async () => {},
  initializeHandoff: async () => {},
  isHandoff: false,
  messages: [],
  shouldSupressHandoffInputDisplay: false,
});

export default function Chat({
  addMessage,
  agentName,
  ask,
  className,
  conversationId,
  handleEndHandoff,
  initializeHandoff,
  isHandoff,
  messages,
  shouldSupressHandoffInputDisplay,
  children,
}: React.PropsWithChildren<ChatProps>) {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const { brandColor, brandFontColor } = useSettings();
  useIdleMessage({
    messages: messages as ChatMessage[],
    conversationId,
    agentName: agentName || "",
    addMessage,
  });
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
        ask,
        initializeHandoff,
        agentName,
        isHandoff,
        handleEndHandoff,
        shouldSupressHandoffInputDisplay,
        messages,
        addMessage,
        conversationId,
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
