import {ReactMarkdown} from '@magi/components/ReactMarkdown'
import React, {useState} from 'react'

import {type TicketMessage} from '@magi/types/data'

export interface BotMessageProps {
  message: TicketMessage
  linkTargetInNewTab?: boolean
}

export function UserMessage({text, linkTargetInNewTab = true}: {text: string; linkTargetInNewTab?: boolean}) {
  return (
    <div className="text-xs">
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>{text}</ReactMarkdown>
    </div>
  )
}

export function BotMessage({message, linkTargetInNewTab = true}: BotMessageProps) {
  return (
    <>
      <div className="prose max-w-full overflow-auto text-xs">
        <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>{message.responses[0].text}</ReactMarkdown>
      </div>
    </>
  )
}
