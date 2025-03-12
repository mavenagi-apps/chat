import clsx from "clsx";
import React, { useEffect, useMemo, useState } from "react";

import {
  isBotMessage,
  type ChatMessage,
  type CombinedMessage,
} from "@/src/types";
import { useSettings } from "@/src/app/providers/SettingsProvider";
import type { Attachment } from "mavenagi/api";
import type { InitializeHandoffParams } from "@/src/lib/handoff/types";
interface ChatContextProps {
  agentName: string | null;
  conversationId: string;
  followUpQuestions: string[];
  isHandoff: boolean;
  messages: CombinedMessage[];
  disableAttachments: boolean;
  shouldSupressHandoffInputDisplay: boolean;
  addMessage: (message: ChatMessage) => void;
  ask: (question: string, attachments?: Attachment[]) => Promise<void>;
  handleEndHandoff: () => Promise<void>;
  initializeHandoff: (params: InitializeHandoffParams) => Promise<void>;
}

interface ChatProps
  extends Omit<ChatContextProps, "followUpQuestions" | "disableAttachments"> {
  brandColor?: string;
  className?: string;
}

export const ChatContext = React.createContext<ChatContextProps>({
  agentName: null,
  conversationId: "",
  followUpQuestions: [],
  isHandoff: false,
  messages: [],
  disableAttachments: false,
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
  const { branding, misc } = useSettings();

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

  const disableAttachmentsOrIsHandoff = useMemo(
    () => misc.disableAttachments || isHandoff,
    [misc.disableAttachments, isHandoff],
  );

  return (
    <ChatContext.Provider
      value={{
        agentName,
        conversationId,
        followUpQuestions,
        isHandoff,
        messages,
        disableAttachments: disableAttachmentsOrIsHandoff,
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
          "--brand-color": branding.brandColor,
          "--brand-font-color": branding.brandFontColor || "#000000",
        }}
      >
        {children}
      </div>
    </ChatContext.Provider>
  );
}
