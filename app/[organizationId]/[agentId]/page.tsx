"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import Chat from "@magi/components/chat/Chat";
import { ChatInput } from "@magi/components/chat/ChatInput";
import { useChat } from "@magi/components/chat/use-chat";
import { MagiEvent } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/use-analytics";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useIframeMessaging } from "@/lib/useIframeMessaging";
import { AuthProvider } from "@/app/providers/AuthProvider";
import { CustomDataProvider } from "@/app/providers/CustomDataProvider";
import { ChatHeader } from "@magi/components/chat/ChatHeader";
import { WelcomeMessage } from "@magi/components/chat/WelcomeChatMessage";
import { ChatMessages } from "@magi/components/chat/ChatMessages";
import { useAskQuestion } from "@/lib/useAskQuestion";
import { useScrollToBottom } from "@/lib/useScrollToBottom";
import { useHandoff } from "@/lib/useHandoff";
import { HandoffStatus } from "@/app/constants/handoff";
import { PoweredByMaven } from "@magi/components/chat/PoweredByMaven";
import type { CombinedMessage } from "@/types";
import { TypingIndicator } from "@magi/components/chat/TypingIndicator";

function ChatPage() {
  const analytics = useAnalytics();
  const { agentId }: { organizationId: string; agentId: string } = useParams();
  const { branding } = useSettings();
  const [messagesContainerRef, messagesEndRef] =
    useScrollToBottom<HTMLDivElement>();

  // Maven chat logic
  const {
    addMessage,
    conversationId,
    isLoading,
    isResponseAvailable,
    mavenUserId,
    messages,
    onBailoutFormSubmitSuccess,
  } = useChat();

  const ask = useAskQuestion({
    addMessage,
    conversationId,
  });

  const {
    agentName,
    askHandoff,
    handleEndHandoff,
    handoffChatEvents,
    handoffStatus,
    initializeHandoff,
    shouldSupressHandoffInputDisplay,
    showTypingIndicator,
  } = useHandoff({
    messages,
    mavenConversationId: conversationId,
  });

  useEffect(() => {
    analytics.logEvent(MagiEvent.chatHomeView, { agentId });
  }, [agentId, analytics]);

  const combinedMessages: CombinedMessage[] = useMemo(() => {
    return [...messages, ...handoffChatEvents]
      .filter(
        (message): message is typeof message & { timestamp: number } =>
          "timestamp" in message && !!message.timestamp,
      )
      .sort((a, b) => a.timestamp - b.timestamp);
  }, [messages, handoffChatEvents]);

  const isHandoff = handoffStatus === HandoffStatus.INITIALIZED;

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      <ChatHeader logoUrl={branding.logoUrl} />
      <Chat
        {...{
          agentName,
          brandColor: branding.brandColor,
          conversationId,
          isHandoff,
          messages: combinedMessages,
          shouldSupressHandoffInputDisplay,
          addMessage,
          ask: handoffStatus === HandoffStatus.INITIALIZED ? askHandoff : ask,
          handleEndHandoff,
          initializeHandoff,
        }}
      >
        <div className="flex flex-1 flex-col overflow-auto text-xs">
          <div
            ref={messagesContainerRef}
            className="mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5"
          >
            <WelcomeMessage
              {...{
                agentId,
                conversationId,
              }}
            />

            <ChatMessages
              {...{
                conversationId,
                isLoading,
                isResponseAvailable: isResponseAvailable || false,
                mavenUserId,
                messages: combinedMessages,
                onBailoutFormSubmitSuccess,
              }}
            />

            {showTypingIndicator && <TypingIndicator />}
            <div
              ref={messagesEndRef}
              className="shrink-0 min-w-[24px] min-h-[24px]"
            />
          </div>

          <PoweredByMaven
            shouldRender={combinedMessages.length === 0 && !isLoading}
          />
        </div>

        <ChatInput
          data-testid="chat-input"
          isSubmitting={isLoading}
          questionPlaceholder={"question_placeholder"}
        />
      </Chat>
    </main>
  );
}

export default function ChatPageWrapper() {
  const { loading, signedUserData, unsignedUserData, customData } =
    useIframeMessaging();

  if (loading) return null;

  return (
    <AuthProvider
      signedUserData={signedUserData}
      unsignedUserData={unsignedUserData}
    >
      <CustomDataProvider customData={customData}>
        <ChatPage />
      </CustomDataProvider>
    </AuthProvider>
  );
}
