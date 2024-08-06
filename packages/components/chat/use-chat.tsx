import * as Sentry from '@sentry/nextjs'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { nanoid } from 'nanoid'

import {type TicketMessage} from '@magi/types/data'

import {type ChatMessage} from './Chat'
import { create } from '@/app/actions';

// type UseChatOptions = {
//   ask: (props: {question: string; signal: AbortSignal}) => AsyncGenerator<TicketMessage>
// }

type UseChatOptions = {
  orgFriendlyId: string,
  id: string,
}

export function useChat({ orgFriendlyId, id, }: UseChatOptions) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [ticketId, setTicketId] = React.useState<string>(nanoid())
  const [abortController, setAbortController] = React.useState(
    new AbortController()
  );


  // const mutation = useMutation({
  //   mutationFn: async ({question, signal}: {question: string; signal: AbortSignal}) => {      
  //     create({orgFriendlyId, id, question, ticketId})
  //     // const reader = apiAsk({question, signal})
  //     // for await (const message of reader) {
  //     //   if (signal.aborted) {
  //     //     break
  //     //   }
  //     //   if (message.ticketId) {
  //     //     setTicketId(message.ticketId)
  //     //   }
  //     //   setMessages(messages => {
  //     //     if (messages.length === 0 || messages[messages.length - 1].type === 'USER') {
  //     //       return [...messages, message]
  //     //     } else {
  //     //       return [...messages.slice(0, -1), message]
  //     //     }
  //     //   })
  //     // }
  //   },
  //   onError: error => {
  //     Sentry.captureException(error)
  //     setMessages(messages => [...messages, {text: error.message, type: 'ERROR'}])
  //   },
  // })

  const ask = (messages: ChatMessage[]) => {
    abortController.abort()
    const newAbortController = new AbortController()
    setAbortController(newAbortController)
    if (messages.length > 0 && messages[messages.length - 1].type === 'USER') {
      // mutation.mutate({question: messages[messages.length - 1].text, signal: newAbortController.signal})
      create({orgFriendlyId, id, question: messages[messages.length - 1].text, ticketId})
    }
  }

  return {
    messages,
    askQuestion: (message: ChatMessage) => {
      setMessages(prevState => [...prevState, message])
      ask([...messages, message])
    },
    setMessages: (newMessages: ChatMessage[]) => {
      setTicketId(nanoid());
      setMessages(newMessages)
      ask(newMessages)
    },
    // isLoading: mutation.isPending,
    // isResponseAvailable: !mutation.isPending || (messages.length > 0 && messages[messages.length - 1].type !== 'USER'),
    isLoading: false,
    isResponseAvailable: (messages.length > 0 && messages[messages.length - 1].type !== 'USER'),
    ticketId,
  }
}
