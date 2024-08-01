import {ReactMarkdown} from '@/components/ReactMarkdown'
import SentimentBadge from '@/components/SentimentBadge'
import Spinner from '@/components/Spinner'
import Chat, {type ChatMessage} from '@/components/chat/Chat'
import {BotMessage, UserMessage} from '@/components/chat/ChatMessage'
import FeedbackForm from '@/components/chat/FeedbackForm'
import {MagiEvent} from '@/lib/analytics/events'
import {getSources, showBotAnswer} from '@/lib/chat/chat-helpers'
import {type IntegrationAdapter} from '@/lib/integration/integration-adapter'
import {getLanguageDisplayName, isEqualLanguage} from '@/lib/language-utils'
import {useAnalytics} from '@/lib/use-analytics'
import {askStreamFromUrl} from '@/lib/use-ticket-message-stream'
import {useMutation, useQuery, useSuspenseQuery} from '@tanstack/react-query'
import {useTranslations} from 'next-intl'
import React, {useEffect, useState} from 'react'
import {HiArrowNarrowLeft, HiArrowNarrowRight} from 'react-icons/hi'
import {HiClipboardDocument, HiOutlineExclamationCircle} from 'react-icons/hi2'
import showdown from 'showdown'
import {toast} from 'sonner'

import {FetchError} from '@magi/fetcher'
import {type CopilotConfig, type Feedback, MessageType, type TicketWithMessages} from '@magi/types/data'
import {Badge, Button, Strong, TextAnchor} from '@magi/ui'

import {ChatBubble} from './ChatCard'
import {ChatInput} from './ChatInput'
import {TranslateSuggestion} from './translate-suggestion'
import {useChat} from './use-chat'

export interface CopilotProps {
  adapter: IntegrationAdapter
  unprefixedExternalTicketId: string
  insertFn?: (message: string) => void
  copyToClipboardFn?: (message: string) => void
  showCopyButtonAsPrimary?: boolean
  showClipboardButton?: boolean
}

export default function Copilot({
  adapter,
  unprefixedExternalTicketId,
  insertFn,
  copyToClipboardFn,
  showCopyButtonAsPrimary = false,
  showClipboardButton = true,
}: CopilotProps) {
  const t = useTranslations('chat.Copilot')

  const [showSuggestedResponse, setShowSuggestedResponse] = useState(true)

  const {messages, askQuestion, ticketId, isLoading, isResponseAvailable} = useChat({
    ask: async function* ({question, signal}) {
      const blockingProxyResponse = await adapter.proxyFetch<TicketWithMessages>(
        `blocking-proxy/request/${encodeURIComponent(`${window.location.origin}/api/v1/integration/${adapter.type.toLowerCase()}/tickets/${unprefixedExternalTicketId}/ask/stream`)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          data: {
            q: question,
            ticket_id: ticketId,
          },
        }
      )
      yield* askStreamFromUrl({url: await blockingProxyResponse.text(), signal})
    },
  })

  const copilotConfig = useSuspenseQuery({
    queryKey: [adapter.type, 'copilot-config'],
    queryFn: async () => {
      return await (
        await adapter.proxyFetch<CopilotConfig>(`integration/${adapter.type.toLowerCase()}/copilotConfig`)
      ).json()
    },
  }).data

  const unsyncedTicket = useSuspenseQuery({
    queryKey: [adapter.type, 'tickets', unprefixedExternalTicketId],
    queryFn: async () => {
      try {
        return await (
          await adapter.proxyFetch<TicketWithMessages>(
            `integration/${adapter.type.toLowerCase()}/tickets/${unprefixedExternalTicketId}`
          )
        ).json()
      } catch (error) {
        let awaitedError = error
        if (error instanceof Promise) {
          awaitedError = await error
        }
        if (awaitedError instanceof FetchError && awaitedError.response.status === 404) {
          return null
        }
        throw awaitedError
      }
    },
  }).data

  // Kick off a ticket sync which may take a long time.
  // When this finishes, it will replace the fast-but-unsynced ticket data
  const {
    data: syncedTicket,
    isPending: syncedTicketIsPending,
    error: syncedTicketError,
  } = useQuery({
    queryKey: [adapter.type, 'tickets', unprefixedExternalTicketId, 'sync'],
    queryFn: async () => {
      try {
        return await (
          await adapter.proxyFetch<TicketWithMessages>(
            `integration/${adapter.type.toLowerCase()}/tickets/${unprefixedExternalTicketId}/sync`,
            {
              viaBlockingProxy: true,
            }
          )
        ).json()
      } catch (error) {
        let awaitedError = error
        if (error instanceof Promise) {
          awaitedError = await error
        }
        throw awaitedError
      }
    },
    // This is a very expensive call for the backend, so we do not retry
    retry: false,
  })

  const ticketWithMessages = syncedTicket || unsyncedTicket
  const botSuggestionShouldExist =
    !syncedTicket || syncedTicket?.messages.filter(value => value.type === MessageType.USER).length > 0
  const botSuggestion = ticketWithMessages?.messages
    .filter(value => value.type === MessageType.BOT_SUGGESTION)
    .slice(-1)[0]

  const showTranslateUI =
    botSuggestion?.language?.code && !isEqualLanguage(botSuggestion.language.code, copilotConfig.languageCode)

  const analytics = useAnalytics()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function logAnalyticsEvent(eventName: MagiEvent, eventData?: Record<string, any>) {
    analytics.logEvent(eventName, {
      integration: adapter.type,
      agentId: ticketWithMessages?.ticket.agentId,
      ticketId: ticketWithMessages?.ticket.externalId,
      ticketCategory: ticketWithMessages?.ticket.detailedCategory,
      ...eventData,
    })
  }

  useEffect(() => {
    logAnalyticsEvent(MagiEvent.copilotHomeView)
  }, [ticketWithMessages?.ticket.externalId])

  const feedbackCreateMutation = useMutation({
    mutationFn: async ({ticketMessageId, feedback}: {ticketMessageId: string; feedback: Partial<Feedback>}) => {
      return await (
        await adapter.proxyFetch<Feedback>(`ticketmessages/${ticketMessageId}/feedback`, {
          method: 'POST',
          data: feedback,
          headers: {'Content-Type': 'application/json'},
        })
      ).json()
    },
  })
  const feedbackUpdateMutation = useMutation({
    mutationFn: async ({feedbackId, feedback}: {feedbackId: string; feedback: Partial<Feedback>}) => {
      return await (
        await adapter.proxyFetch<Feedback>(`feedbacks/${feedbackId}`, {
          method: 'PUT',
          data: feedback,
          headers: {'Content-Type': 'application/json'},
        })
      ).json()
    },
  })

  // This mutation is separate from the one above as the above changes state in the ui
  // Insert feedback is automatic/hidden from the user
  const insertFeedbackMutation = useMutation({
    mutationFn: async ({ticketMessageId}: {ticketMessageId: string}) => {
      return await adapter.proxyFetch(`ticketmessages/${ticketMessageId}/feedback`, {
        method: 'POST',
        data: {type: 'INSERT'},
        headers: {'Content-Type': 'application/json'},
      })
    },
    onError: async error => {
      console.error(error)
    },
  })

  async function insertWithAnalytics(message: ChatMessage | string) {
    const stringMessage = typeof message === 'string'
    const messageId = !stringMessage && 'id' in message ? message.id : ''
    logAnalyticsEvent(MagiEvent.copilotInsertClick, {
      message: stringMessage ? message : messageId,
    })
    insertFn?.(
      stringMessage ? message : new showdown.Converter().makeHtml(message.text).replaceAll('</p>', '</p><p><br/></p>')
    )
    // Track automatic feedback whenever a message is inserted
    if (messageId) {
      insertFeedbackMutation.mutate({ticketMessageId: messageId})
    }
  }

  async function copyWithAnalytics(message: ChatMessage | string) {
    const stringMessage = typeof message === 'string'
    const messageId = !stringMessage && 'id' in message ? message.id : ''
    logAnalyticsEvent(MagiEvent.copilotCopyClick, {
      message: stringMessage ? message : messageId,
    })

    copyToClipboardFn?.(stringMessage ? message : message.text)

    toast(t('copied_to_clipboard'))

    // Track automatic feedback whenever a message is inserted
    if (messageId) {
      insertFeedbackMutation.mutate({ticketMessageId: messageId})
    }
  }

  const latestQuestionRef = React.useRef<HTMLDivElement>(null)

  const showTopLevelLoad = !ticketWithMessages
  const showError = !botSuggestion && botSuggestionShouldExist && !syncedTicketIsPending

  if (showTopLevelLoad || showError) {
    if (showError) {
      return (
        <ChatBubble direction="left" className="m-2 border-gray-500 bg-gray-50 text-xs">
          <div className="flex items-center">
            <div>
              <HiOutlineExclamationCircle className="size-5 text-gray-500" />
            </div>
            <div className="ml-3 flex-1 content-center">{syncedTicketError?.message || t('generic_error')}</div>
          </div>
        </ChatBubble>
      )
    } else {
      // This happens when the ticket has never been synced to our system
      // The second sync ticket call will slowly sync the ticket
      return <Spinner />
    }
  }

  const ask = async (question: string) => {
    logAnalyticsEvent(MagiEvent.copilotAskClick)
    askQuestion({
      text: question,
      type: 'USER',
    })
    setTimeout(
      () => latestQuestionRef.current?.scrollIntoView({behavior: 'smooth', block: 'start', inline: 'nearest'}),
      0
    )
  }

  return (
    <Chat messages={messages} askFn={ask}>
      <div className="flex flex-1 flex-col overflow-auto text-xs">
        <div className="mx-auto w-full max-w-3xl flex-1 text-gray-800 sm:mt-5 sm:px-5">
          <ChatBubble direction="full">
            <h5 className="font-semibold text-gray-900">{t('ticket_summary')}</h5>
            <div className="flex flex-row flex-wrap gap-2 border-b border-gray-200 pb-4">
              {ticketWithMessages && (
                <Badge color="zinc">
                  {t('interactions')}
                  {': '}
                  {ticketWithMessages.messages.filter(message => message.type !== 'BOT_SUGGESTION').length}
                </Badge>
              )}
              {ticketWithMessages?.sentiment && (
                <SentimentBadge sentiment={ticketWithMessages?.sentiment} includePrefix={true} />
              )}
            </div>
            <div className="grid sm:grid-cols-[auto_1fr]">
              {ticketWithMessages?.ticket.detailedCategory && (
                <>
                  <div className="pb-2 pr-2 font-semibold text-gray-900">{t('category')}</div>
                  <div className="pb-2">{ticketWithMessages.ticket.detailedCategory}</div>
                </>
              )}
              {ticketWithMessages?.ticket.resolutionStatusSummary && (
                <>
                  <div className="pb-2 pr-2 font-semibold text-gray-900">{t('resolution_status')}</div>
                  <div className="pb-2">{ticketWithMessages.ticket.resolutionStatusSummary}</div>
                </>
              )}
              {ticketWithMessages?.ticket.userRequestSummary && (
                <>
                  <div className="pb-2 pr-2 font-semibold text-gray-900">{t('user_request')}</div>
                  <div className="pb-2">
                    <ReactMarkdown bulletsInside>{ticketWithMessages.ticket.userRequestSummary}</ReactMarkdown>
                  </div>
                </>
              )}
              {ticketWithMessages?.ticket.agentResponseSummary && (
                <>
                  <div className="pb-2 pr-2 font-semibold text-gray-900">{t('agent_response')}</div>
                  <div className="pb-2">
                    <ReactMarkdown bulletsInside>{ticketWithMessages.ticket.agentResponseSummary}</ReactMarkdown>
                  </div>
                </>
              )}
            </div>
          </ChatBubble>
          {botSuggestion && (
            <ChatBubble direction="full">
              {showSuggestedResponse && (
                <>
                  <h5 className="font-semibold text-gray-900">{t('suggested_response')}</h5>

                  {showTranslateUI && botSuggestion.language?.code && (
                    <div className="flex flex-row flex-wrap font-bold">
                      <Badge color="zinc" data-testid="bot_suggestion_language_badge">
                        <Strong>{getLanguageDisplayName(botSuggestion.language?.code)}</Strong>
                      </Badge>
                    </div>
                  )}

                  {botSuggestion.text ? (
                    <>
                      <BotMessage message={botSuggestion} />

                      {getSources({message: botSuggestion}).length > 0 && (
                        <div className="flex flex-col">
                          <div className="text-gray-500">{t('related_links')}</div>
                          <ul className="mt-2 space-y-2">
                            {getSources({message: botSuggestion}).map((source, index) => (
                              <li key={index} className="flex items-center space-x-3">
                                <HiArrowNarrowRight className="h-3.5 w-3.5" />
                                <span className="flex-1">
                                  <TextAnchor key={index} href={source.url} target="_blank">
                                    {source.title || source.url}
                                  </TextAnchor>
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <FeedbackForm
                        message={botSuggestion}
                        showClipboardButton={!showCopyButtonAsPrimary && showClipboardButton}
                        copyToClipboardFn={copyToClipboardFn && !insertFn ? undefined : copyToClipboardFn}
                        feedbackCreateFn={async (_, {ticketMessageId, feedback}) => {
                          logAnalyticsEvent(MagiEvent.copilotFeedbackClick, {
                            messageId: ticketMessageId,
                            feedback: feedback.type,
                          })
                          return await feedbackCreateMutation.mutateAsync({ticketMessageId, feedback})
                        }}
                        feedbackUpdateFn={async (_, {feedbackId, feedback}) => {
                          return await feedbackUpdateMutation.mutateAsync({feedbackId, feedback})
                        }}
                      >
                        {insertFn && !showCopyButtonAsPrimary && (
                          <Button onClick={() => insertWithAnalytics(botSuggestion)}>
                            <HiArrowNarrowLeft data-slot="icon" />
                            {t('insert')}
                          </Button>
                        )}
                        {copyToClipboardFn && showCopyButtonAsPrimary && (
                          <Button onClick={() => copyWithAnalytics(botSuggestion)}>
                            <HiClipboardDocument data-slot="icon" />
                            {t('copy')}
                          </Button>
                        )}
                      </FeedbackForm>
                    </>
                  ) : (
                    <div>{t('generate_answer_error')}</div>
                  )}
                  {/* </div> */}
                </>
              )}
              {showTranslateUI && (
                <TranslateSuggestion
                  copyToClipboardFn={copyToClipboardFn}
                  botSuggestion={botSuggestion}
                  showSuggestedResponse={setShowSuggestedResponse}
                  updateSuggestedResponse={(text: string) => (botSuggestion.text = text)}
                  adapter={adapter}
                  defaultLanguage={copilotConfig.languageCode}
                />
              )}
              {/* </div> */}
            </ChatBubble>
          )}
          {messages.map((value, index) =>
            value.type === 'HUMAN_AGENT' || value.type === 'USER' ? (
              <ChatBubble
                direction="right"
                className="bg-gray-50"
                key={index}
                ref={index === messages.length - 1 ? latestQuestionRef : null}
              >
                <UserMessage text={value.text} />
              </ChatBubble>
            ) : value.type === 'ERROR' ? (
              <ChatBubble key={index} direction="left" className="border-red-500 bg-red-50 text-xs">
                <div className="flex items-center">
                  <div>
                    <HiOutlineExclamationCircle className="size-5 text-red-500" />
                  </div>
                  <div className="ml-3 flex-1 content-center">{value.text || t('generic_error')}</div>
                </div>
              </ChatBubble>
            ) : (
              <ChatBubble key={index} direction="left">
                {showBotAnswer({message: value}) ? (
                  <BotMessage message={value} />
                ) : (
                  <div className="prose max-w-full text-xs">{t('bot_answer_error')}</div>
                )}

                {getSources({message: value}).length > 0 && (
                  <div className="flex flex-col">
                    <div className="text-gray-500">{t('related_links')}</div>
                    <ul className="mt-2 space-y-2">
                      {getSources({message: value}).map((source, index) => (
                        <li key={index} className="flex items-center space-x-3">
                          <HiArrowNarrowRight className="h-3.5 w-3.5" />
                          <span className="flex-1">
                            <TextAnchor key={index} href={source.url} target="_blank">
                              {source.title || source.url}
                            </TextAnchor>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <FeedbackForm
                  message={value}
                  copyToClipboardFn={copyToClipboardFn}
                  showClipboardButton={!showCopyButtonAsPrimary && showClipboardButton}
                  feedbackCreateFn={async (_, {ticketMessageId, feedback}) => {
                    logAnalyticsEvent(MagiEvent.copilotFeedbackClick, {
                      messageId: ticketMessageId,
                      feedback: feedback.type,
                    })
                    return await feedbackCreateMutation.mutateAsync({ticketMessageId, feedback})
                  }}
                  feedbackUpdateFn={async (_, {feedbackId, feedback}) => {
                    return await feedbackUpdateMutation.mutateAsync({feedbackId, feedback})
                  }}
                >
                  <Button onClick={() => insertWithAnalytics(value)}>
                    <HiArrowNarrowLeft data-slot="icon" />
                    {t('insert')}
                  </Button>
                </FeedbackForm>
              </ChatBubble>
            )
          )}
          {((!botSuggestion && botSuggestionShouldExist) || (isLoading && !isResponseAvailable)) && (
            <div className="my-5">
              <Spinner />
            </div>
          )}
        </div>
      </div>
      <ChatInput questionPlaceholder="Ask Co-pilot a question..." isSubmitting={isLoading} />
    </Chat>
  )
}
