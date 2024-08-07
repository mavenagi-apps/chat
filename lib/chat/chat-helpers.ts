import {type Source, type TicketMessage, TicketMessageStatus} from '@magi/types/data'

export function showBotAnswer({message}: {message: TicketMessage | null}) {
  return (
    message?.conversationMessageId?.referenceId !== null
  )
}

export function getFollowUpQuestions({message, count = 3}: {message: TicketMessage | null; count?: number}): string[] {
  return showBotAnswer({message: message}) ? message?.botContext?.followUpQuestions?.slice(0, count) || [] : []
}

export function getSources({message}: {message: TicketMessage | null}): Source[] {
  return showBotAnswer({message: message}) ? message?.botContext?.sources?.slice(0, 3) || [] : []
}
