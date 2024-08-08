import clsx from 'clsx'
import React, {useEffect, useState} from 'react'

import {type TicketMessage} from '@magi/types/data'

export type ChatMessage =
  | {text: string; type: 'USER'}
  | {
      text: string
      type: 'ERROR'
    }
  | TicketMessage

export interface ChatProps {
  messages: ChatMessage[]
  askFn: (question: string) => Promise<void>
  brandColor?: string
  className?: string
}

export const ChatContext = React.createContext<{
  followUpQuestions: string[]
  ask: (question: string) => Promise<void>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
}>({} as any)

export default function Chat({
  messages,
  askFn,
  className,
  children,
}: React.PropsWithChildren<ChatProps>) {
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([])
  useEffect(() => {
    if (messages.length > 0) {
      const lastMsg = messages[messages.length - 1]
      if ('botContext' in lastMsg && lastMsg.botContext !== undefined) {
        setFollowUpQuestions(lastMsg.botContext.followUpQuestions || [])
        return
      }
    }
    setFollowUpQuestions([])
  }, [messages])

  return (
    <ChatContext.Provider value={{followUpQuestions, ask: askFn}}>
      <div
        className={clsx(className, 'flex w-full flex-1 flex-col overflow-auto')}
        style={{
          // @ts-expect-error css variable
          '--brand-color': '#004f32',
          '--brand-text-color': '#FFFFFF',
        }}
      >
        {children}
      </div>
    </ChatContext.Provider>
  )
}
