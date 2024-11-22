'use client';

import * as React from 'react';
import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Chat from '@magi/components/chat/Chat';
import { ChatInput } from '@magi/components/chat/ChatInput';
import { useChat } from '@magi/components/chat/use-chat';
import { MagiEvent } from '@/lib/analytics/events';
import { useAnalytics } from '@/lib/use-analytics';
import { useSettings } from '@/app/providers/SettingsProvider';
import { useIframeMessaging } from '@/lib/useIframeMessaging';
import { ChatHeader } from '@magi/components/chat/ChatHeader';
import { WelcomeMessage } from '@magi/components/chat/WelcomeChatMessage';
import { ChatMessages } from '@magi/components/chat/ChatMessages';
import { useAskQuestion } from '@/lib/useAskQuestion';
import { useScrollToLatest } from '@/lib/useScrollToLatest';
import { PoweredByMaven } from '@magi/components/chat/PoweredByMaven';

function ChatPage({ userData, signedUserData }: { userData: Record<string, string> | null, signedUserData: string | null }) {
  const analytics = useAnalytics();
  const { orgFriendlyId, id: agentFriendlyId }: { orgFriendlyId: string, id: string } = useParams();

  const { brandColor, logoUrl } = useSettings();

  // Maven chat logic
  const {
    messages,
    isLoading,
    isResponseAvailable,
    askQuestion,
    conversationId,
  } = useChat({
    orgFriendlyId,
    id: agentFriendlyId,
    userData,
    signedUserData
  });

  const { scrollToLatest, latestChatBubbleRef } = useScrollToLatest();

  const ask = useAskQuestion({
    agentFriendlyId,
    conversationId,
    askQuestion,
    scrollToLatest,
  });

  useEffect(() => {
    analytics.logEvent(MagiEvent.chatHomeView, { agentId: agentFriendlyId });
  }, [agentFriendlyId, analytics]);

  return (
    <main className='flex h-screen flex-col bg-gray-50'>
      <ChatHeader logoUrl={logoUrl} />
      <Chat brandColor={brandColor} messages={messages} askFn={ask}>
        <div className='flex flex-1 flex-col overflow-auto text-xs'>
          <div className='mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5'>
            <WelcomeMessage
              agentFriendlyId={agentFriendlyId}
              conversationId={conversationId}
            />

            <ChatMessages
              messages={messages}
              isLoading={isLoading}
              isResponseAvailable={isResponseAvailable || false}
              conversationId={conversationId}
              userData={userData}
              ref={latestChatBubbleRef}
            />
          </div>

          <PoweredByMaven shouldRender={messages.length === 0 && !isLoading} />
        </div>

        <ChatInput
          questionPlaceholder={'question_placeholder'}
          isSubmitting={isLoading}
          data-testid='chat-input'
        />
      </Chat>
    </main>
  );
}

export default function ChatPageWrapper() {
  const { loading, userData, signedUserData } = useIframeMessaging();
  
  if (loading) return null;
  
  return <ChatPage userData={userData} signedUserData={signedUserData} />;
}
