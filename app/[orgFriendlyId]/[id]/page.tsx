"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Chat from "@magi/components/chat/Chat";
import { ChatInput } from "@magi/components/chat/ChatInput";
import { useChat } from "@magi/components/chat/use-chat";
import { MagiEvent } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/use-analytics";
import { useSettings } from "@/app/providers/SettingsProvider";
import { useIframeMessaging } from "@/lib/useIframeMessaging";
import { ChatHeader } from "@magi/components/chat/ChatHeader";
import { WelcomeMessage } from "@magi/components/chat/WelcomeChatMessage";
import { ChatMessages } from "@magi/components/chat/ChatMessages";
import { useAskQuestion } from "@/lib/useAskQuestion";
import { useScrollToLatest } from "@/lib/useScrollToLatest";
import { HandoffStatus, useHandoff } from "@/lib/useHandoff";
import { PoweredByMaven } from "@magi/components/chat/PoweredByMaven";
import type {
  ChatEndedMessage,
  ChatEstablishedMessage,
  ZendeskWebhookMessage,
} from "@/types";
import type { Message } from "@/types";

function ChatPage({ signedUserData }: { signedUserData: string | null }) {
  const analytics = useAnalytics();
  const { id: agentFriendlyId }: { orgFriendlyId: string; id: string } =
    useParams();
  const { brandColor, logoUrl } = useSettings();
  const [combinedMessages, setCombinedMessages] = useState<
    (
      | Message
      | ZendeskWebhookMessage
      | ChatEstablishedMessage
      | ChatEndedMessage
    )[]
  >([]);

  // Maven chat logic
  const {
    messages,
    isLoading,
    isResponseAvailable,
    askQuestion,
    conversationId,
    mavenUserId,
  } = useChat({
    signedUserData,
  });

  const { scrollToLatest, latestChatBubbleRef } = useScrollToLatest();

  const ask = useAskQuestion({
    conversationId,
    askQuestion,
    scrollToLatest,
  });

  const {
    initializeHandoff,
    handoffChatEvents,
    agentName,
    handoffStatus,
    askHandoff,
    handleEndHandoff,
  } = useHandoff({
    messages,
    signedUserData,
    mavenConversationId: conversationId,
  });

  useEffect(() => {
    analytics.logEvent(MagiEvent.chatHomeView, { agentId: agentFriendlyId });
  }, [agentFriendlyId, analytics]);

  useEffect(() => {
    setCombinedMessages(
      [...messages, ...handoffChatEvents]
        .filter(({ timestamp }) => !!timestamp)
        .sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0)),
    );
    scrollToLatest();
  }, [messages, handoffChatEvents, setCombinedMessages, scrollToLatest]);
  const isHandoff = handoffStatus === HandoffStatus.INITIALIZED;

  return (
    <main className="flex h-screen flex-col bg-gray-50">
      <ChatHeader logoUrl={logoUrl} />
      <Chat
        brandColor={brandColor}
        messages={combinedMessages}
        askFn={handoffStatus === HandoffStatus.INITIALIZED ? askHandoff : ask}
        initializeHandoff={initializeHandoff}
        agentName={agentName}
        isHandoff={isHandoff}
        handleEndHandoff={handleEndHandoff}
      >
        <div className="flex flex-1 flex-col overflow-auto text-xs">
          <div className="mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5">
            <WelcomeMessage
              agentFriendlyId={agentFriendlyId}
              conversationId={conversationId}
            />

            <ChatMessages
              messages={combinedMessages}
              isLoading={isLoading}
              isResponseAvailable={isResponseAvailable || false}
              conversationId={conversationId}
              ref={latestChatBubbleRef}
              mavenUserId={mavenUserId}
            />
          </div>

          <PoweredByMaven shouldRender={messages.length === 0 && !isLoading} />
        </div>

        <ChatInput
          questionPlaceholder={"question_placeholder"}
          isSubmitting={isLoading}
          data-testid="chat-input"
        />
      </Chat>
    </main>
  );
}

export default function ChatPageWrapper() {
  const { loading, signedUserData } = useIframeMessaging();

  if (loading) return null;

  return <ChatPage signedUserData={signedUserData} />;
}
