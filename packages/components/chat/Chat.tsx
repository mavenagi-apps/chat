import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";

import { isBotMessage, ChatMessage, CombinedMessage } from "@/types";
import { useSettings } from "@/app/providers/SettingsProvider";
import { Attachment } from "mavenagi/api";
import { useIdleMessage } from "@/lib/useIdleMessage";

interface ChatContextProps {
  agentName: string | null;
  conversationId: string;
  followUpQuestions: string[];
  isHandoff: boolean;
  messages: CombinedMessage[];
  shouldDisableAttachments: boolean;
  shouldSupressHandoffInputDisplay: boolean;
  addMessage: (message: ChatMessage) => void;
  ask: (question: string, attachments?: Attachment[]) => Promise<void>;
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
}

interface ChatProps
  extends Omit<
    ChatContextProps,
    "followUpQuestions" | "shouldDisableAttachments"
  > {
  brandColor?: string;
  className?: string;
}

export const ChatContext = React.createContext<ChatContextProps>({
  agentName: null,
  conversationId: "",
  followUpQuestions: [],
  isHandoff: false,
  messages: [],
  shouldDisableAttachments: false,
  shouldSupressHandoffInputDisplay: false,
  addMessage: () => {},
  ask: async () => {},
  handleEndHandoff: async () => {},
  initializeHandoff: async () => {},
});

export default function Chat({
  agentName,
  children,
  className,
  conversationId,
  isHandoff,
  messages,
  shouldSupressHandoffInputDisplay,
  addMessage,
  ask,
  handleEndHandoff,
  initializeHandoff,
}: React.PropsWithChildren<ChatProps>) {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const { brandColor, brandFontColor, disableAttachments } = useSettings();
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

  const shouldDisableAttachments = useMemo(
    () => disableAttachments || isHandoff,
    [disableAttachments, isHandoff],
  );

  return (
    <ChatContext.Provider
      value={{
        agentName,
        conversationId,
        followUpQuestions,
        isHandoff,
        messages,
        shouldDisableAttachments,
        shouldSupressHandoffInputDisplay,
        addMessage,
        ask,
        handleEndHandoff,
        initializeHandoff,
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
