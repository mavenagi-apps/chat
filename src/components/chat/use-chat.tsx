import * as Sentry from '@sentry/nextjs'
import {useMutation} from '@tanstack/react-query'
import React from 'react'

import {type TicketMessage} from '@magi/types/data'

import {type ChatMessage} from './Chat'

type UseChatOptions = {
  ask: (props: {question: string; signal: AbortSignal}) => AsyncGenerator<TicketMessage>
}

export function useChat({ask: apiAsk}: UseChatOptions) {
  const [messages, setMessages] = React.useState<ChatMessage[]>([])
  const [ticketId, setTicketId] = React.useState<string>()

  const mutation = useMutation({
    mutationFn: async ({question, signal}: {question: string; signal: AbortSignal}) => {
      const reader = apiAsk({question, signal})
      for await (const message of reader) {
        if (signal.aborted) {
          break
        }
        if (message.ticketId) {
          setTicketId(message.ticketId)
        }
        setMessages(messages => {
          if (messages.length === 0 || messages[messages.length - 1].type === 'USER') {
            return [...messages, message]
          } else {
            return [...messages.slice(0, -1), message]
          }
        })
      }
    },
    onError: error => {
      Sentry.captureException(error)
      setMessages(messages => [...messages, {text: error.message, type: 'ERROR'}])
    },
  })

  const [abortController, setAbortController] = React.useState(new AbortController())
  const ask = (messages: ChatMessage[]) => {
    abortController.abort()
    const newAbortController = new AbortController()
    setAbortController(newAbortController)
    if (messages.length > 0 && messages[messages.length - 1].type === 'USER') {
      mutation.mutate({question: messages[messages.length - 1].text, signal: newAbortController.signal})
    }
  }

  return {
    messages,
    askQuestion: (message: ChatMessage) => {
      setMessages(prevState => [...prevState, message])
      ask([...messages, message])
    },
    setMessages: (newMessages: ChatMessage[]) => {
      setTicketId(undefined)
      setMessages(newMessages)
      ask(newMessages)
    },
    isLoading: mutation.isPending,
    isResponseAvailable: !mutation.isPending || (messages.length > 0 && messages[messages.length - 1].type !== 'USER'),
    ticketId,
  }
}
