import {makePeriodicEventIterator} from '@/lib/use-event-stream'

import type {Surface, TicketMessage} from '@magi/types/data'

export async function* askStreamFromUrl({url, signal}: {url: string; signal: AbortSignal}) {
  const eventSource = new EventSource(url)
  try {
    const reader = makePeriodicEventIterator(eventSource, signal)
    for await (const chunk of reader) {
      const message = JSON.parse(chunk, (key, value) => {
        if (key === 'text') {
          // the streaming text needs to be cleaned up, so it renders properly
          return value.replaceAll('\\n', '\n')
        }
        return value
      }) as TicketMessage
      yield message
    }
  } finally {
    eventSource.close()
  }
}

export async function* askStream({
  question,
  ticketId,
  agentId,
  surface,
  signal,
}: {
  question: string
  surface: Surface
  ticketId?: string
  agentId: string
  signal: AbortSignal
}) {
  yield* askStreamFromUrl({
    url:
      window.location.origin +
      `/api/v1/agents/${agentId}/ask/stream?` +
      new URLSearchParams({
        s: surface,
        q: question,
        ...(ticketId !== undefined ? {ticket_id: ticketId} : {}),
      }),
    signal,
  })
}

export async function* playStream({
  agentId,
  ticketId,
  signal,
}: {
  agentId: string
  ticketId: string
  signal: AbortSignal
}) {
  yield* askStreamFromUrl({
    url:
      window.location.origin +
      `/api/v1/agents/${agentId}/playground/stream?` +
      new URLSearchParams({
        ticket_id: ticketId,
      }),
    signal,
  })
}
