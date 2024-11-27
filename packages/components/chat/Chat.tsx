import clsx from 'clsx'
import React, {useEffect, useState} from 'react'

import { type Message, isBotMessage } from '@/types';
import { useSettings } from '@/app/providers/SettingsProvider';

interface ChatProps {
  messages: Message[]
  askFn: (question: string) => Promise<void>
  brandColor?: string
  className?: string
}

export const ChatContext = React.createContext<{
  followUpQuestions: string[]
  ask: (question: string) => Promise<void>
}>({ followUpQuestions: [], ask: async () => {} })

export default function Chat({
  messages,
  askFn,
  className,
  children,
}: React.PropsWithChildren<ChatProps>) {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  const { brandColor, brandFontColor, brandTitleColor } = useSettings();
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]

      if (isBotMessage(lastMsg)) {
        setFollowUpQuestions(lastMsg.metadata?.followupQuestions || [])
        return
      }
    }
    setFollowUpQuestions([])
  }, [messages])

  return (
    <ChatContext.Provider value={{ followUpQuestions, ask: askFn }}>
      <div
        className={clsx(className, 'flex w-full flex-1 flex-col overflow-auto')}
        style={{
          // @ts-expect-error css variable
          '--brand-color': brandColor,
          '--brand-font-color': brandFontColor || '#FFFFFF',
          '--brand-title-color': brandTitleColor || '#FFFFFF',
        }}
      >
        {children}
      </div>
    </ChatContext.Provider>
  );
}
