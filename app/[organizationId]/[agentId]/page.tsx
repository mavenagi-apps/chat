"use client";

import * as React from "react";
import { useEffect, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { CustomDataProvider } from "@/app/providers/CustomDataProvider";
import { useSettings } from "@/app/providers/SettingsProvider";
import { HandoffStatus } from "@/app/constants/handoff";
import { MagiEvent } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/use-analytics";
import { useAskQuestion } from "@/lib/useAskQuestion";
import { useHandoff } from "@/lib/useHandoff";
import { useIdleMessage } from "@/lib/useIdleMessage";
import { useIframeMessaging } from "@/lib/useIframeMessaging";
import { useScrollToBottom } from "@/lib/useScrollToBottom";
import type { CombinedMessage } from "@/types";

import Chat from "@magi/components/chat/Chat";
import { ChatHeader } from "@magi/components/chat/ChatHeader";
import { ChatInput } from "@magi/components/chat/ChatInput";
import { ChatMessages } from "@magi/components/chat/ChatMessages";
import { PoweredByMaven } from "@magi/components/chat/PoweredByMaven";
import { TypingIndicator } from "@magi/components/chat/TypingIndicator";
import { useChat } from "@magi/components/chat/use-chat";
import { WelcomeMessage } from "@magi/components/chat/WelcomeChatMessage";

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

  useIdleMessage({
    agentName: agentName || "",
    conversationId,
    isHandoff,
    messages,
    addMessage,
  });

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      <ChatHeader
        logo={branding.logo}
        fallbackLogo={branding.fallbackLogoUrl}
      />
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
  const searchParams = useSearchParams();
  const disableRedirectParam = searchParams.get("disableRedirect");
  const disableRedirect =
    disableRedirectParam !== null && disableRedirectParam !== "false";
  const { loading, signedUserData, unsignedUserData, customData } =
    useIframeMessaging({ disableRedirect });

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
