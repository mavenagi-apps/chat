import * as Sentry from '@sentry/nextjs'
import {type UseMutationOptions, useMutation, useQuery, useQueryClient, useSuspenseQuery} from '@tanstack/react-query'
import {toast} from 'sonner'

import {FetchError, type Fetcher, type FetcherConfigBase} from '@magi/fetcher'
import type {
  Action,
  ActionChangeSearchStatusRequest,
  Agent,
  AgentApiConfig,
  AgentChatConfig,
  AgentIntegrationConfig,
  AgentStats,
  AgentUserDto,
  BailoutForm,
  Corpus,
  CorpusChangeActivationRequest,
  CorpusSearchRequest,
  CorpusSearchResponse,
  Crawl,
  Document,
  DocumentChangePolicyRequest,
  DocumentSearchRequest,
  DocumentSearchResponse,
  EvalResult,
  EvalResultSet,
  Feedback,
  FeedbackSearchRequest,
  FeedbackSearchResults,
  InboxItemDto,
  InboxItemFixDto,
  InboxSearchRequest,
  Integration,
  Invitation,
  LlmModel,
  LlmUsageContext,
  Member,
  OrgGetPutDto,
  OrgInsightsResponseDto,
  OrgPostDto,
  Organization,
  Page,
  ParsedId,
  Permission,
  PlaygroundRun,
  PlaygroundRunRequest,
  PlaygroundRunResponse,
  PlaygroundTicketSearchRequest,
  PlaygroundTicketSearchResults,
  PromptTemplate,
  PromptTemplateConfig,
  QuickOrgCreateDto,
  ReferenceQuestion,
  ReferenceSession,
  ReferenceSet,
  SalesStatus,
  Ticket,
  TicketCategoryStat,
  TicketInsightsCategory,
  TicketInsightsResults,
  TicketMessage,
  TicketMessageWithFeedbacks,
  TicketSearchRequest,
  TicketSearchResults,
  TicketWithAnalysis,
  TicketWithMessages,
  Trigger,
  User,
  UserExperiments,
} from '@magi/types/data'

import {useFetcher} from '@/lib/fetcher/react'
import {getFetcher} from '@/lib/fetcher/server'

type PaginationParams = {
  page?: number
  size: number
  sort?: string
}

export const rpc_ = (fetcher: Fetcher) => {
  const query = <Input, Output>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    key: string[],
    urlFn: (input: Input) => string,
    fetchConfigFn?: (input: Input) => FetcherConfigBase | undefined
  ) => {
    const queryFn = async (fetcher: Fetcher, input: Input) => {
      const resp = await fetcher.request<Output>({
        method,
        url: urlFn(input),
        ...fetchConfigFn?.(input),
      })
      if (resp.headers.get('content-type')?.includes('application/json')) {
        return await resp.json()
      } else {
        return (await resp.text()) as Output
      }
    }
    const getQueryKey = (input: Input) => [...key, input]
    const getQueryOptions = (fetcher: Fetcher, input: Input) => ({
      queryKey: getQueryKey(input),
      queryFn: async () => await queryFn(fetcher, input),
    })
    return Object.assign((input: Input) => getQueryOptions(fetcher, input), {
      fetch: async (input: Input) => await queryFn(await getFetcher(), input),
      useQuery: (
        input: Input,
        opts?: {
          enabled?: boolean
          retry?: boolean
          throwOnError?: boolean
        }
      ) =>
        useQuery({
          ...getQueryOptions(useFetcher(), input),
          ...(opts ? opts : {}),
        }),
      useSuspenseQuery: (input: Input) => useSuspenseQuery(getQueryOptions(useFetcher(), input)),
    })
  }

  const mutation = <Input, Output = void>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    keys: string[][],
    urlFn: (input: Input) => string,
    dataFn: (input: Input) => unknown,
    fetchConfigFn?: (input: Input) => FetcherConfigBase | undefined
  ) => {
    const getMutationOptions = (fetcher: Fetcher) =>
      ({
        mutationFn: async input => {
          const resp = await fetcher.request<Output>({
            method,
            url: urlFn(input),
            data: dataFn !== undefined ? dataFn(input) : input,
            ...fetchConfigFn?.(input),
          })
          if (resp.headers.get('content-type')?.includes('application/json')) {
            return await resp.json()
          } else {
            return (await resp.text()) as Output
          }
        },
      }) satisfies UseMutationOptions<Output, Error, Input>

    return {
      useMutation: (opts?: UseMutationOptions<Output, Error, unknown>) => {
        const queryClient = useQueryClient()
        return useMutation({
          ...(opts ? opts : {}),
          ...getMutationOptions(useFetcher()),
          onSuccess: (data, variables, context) =>
            Promise.all([
              ...keys.map(queryKey => queryClient.invalidateQueries({queryKey})),
              opts?.onSuccess?.(data, variables, context),
            ]),
          onError: async (error, variables, context) => {
            const eventId = Sentry.captureException(error)
            if (!(error instanceof FetchError) || error.response?.status !== 400) {
              toast.error(error.name, {
                description: (
                  <>
                    {error.message}
                    <br />
                    <br />
                    Event ID: {eventId}
                  </>
                ),
                duration: 5000,
              })
            }
            await opts?.onError?.(error, variables, context)
          },
        })
      },
    }
  }

  return {
    organization: {
      get: query<
        {
          orgId: string
        },
        OrgGetPutDto
      >('GET', ['organization', 'get'], ({orgId}) => `organizations/${orgId}`),
      update: mutation<{data: OrgGetPutDto}, OrgGetPutDto>(
        'PUT',
        [['organization', 'get']],
        () => 'organizations',
        ({data}) => data
      ),
      delete: mutation<{orgId: string}>(
        'DELETE',
        [['organization']],
        ({orgId}) => `organizations/${orgId}`,
        () => undefined
      ),
      getByFriendlyId: query<{orgFriendlyId: string}, Organization>(
        'GET',
        ['organization', 'friendly'],
        ({orgFriendlyId}) => `organizations/friendly/${orgFriendlyId}`
      ),
      getDefaultAgent: query<{orgFriendlyId: string}, Agent | undefined>(
        'GET',
        ['organization', 'friendly', 'agent'],
        ({orgFriendlyId}) => `organizations/friendly/${orgFriendlyId}/agents/default`
      ),
      agents: {
        get: query<{orgId: string}, Agent[]>(
          'GET',
          ['organization', 'agents'],
          ({orgId}) => `organizations/${orgId}/agents`
        ),
        create: mutation<{orgId: string; data: Agent}, Agent>(
          'POST',
          [['organization', 'agents']],
          ({orgId}) => `organizations/${orgId}/agents`,
          ({data}) => data
        ),
      },
      members: {
        get: query<{orgId: string; params: {page: number; size: number}}, Page<Member>>(
          'GET',
          ['organization', 'members'],
          ({orgId}) => `organizations/${orgId}/members`,
          ({params}) => ({params})
        ),
        create: mutation<{orgId: string; data: Member}, Member>(
          'POST',
          [['organization', 'invitations']],
          ({orgId}) => `organizations/${orgId}/members`,
          ({data}) => data
        ),
      },
      invitations: {
        get: query<{orgId: string; params: {page: number; size: number}}, Page<Invitation>>(
          'GET',
          ['organization', 'invitations'],
          ({orgId}) => `organizations/${orgId}/invitations`,
          ({params}) => ({params})
        ),
        delete: mutation<{invitationId: string}, void>(
          'DELETE',
          [['organization', 'invitations']],
          ({invitationId}) => `invitations/${invitationId}`,
          () => undefined
        ),
      },
    },
    agent: {
      get: query<
        {
          agentId: string
        },
        Agent
      >('GET', ['agent', 'get'], ({agentId}) => `agents/${agentId}`),
      update: mutation<
        {
          agentId: string
          agent: Agent
          popularQuestions?: {
            text: string
          }[]
          chatIcon?: File
          chatIconDeleted?: boolean
          logo?: File
          logoDeleted?: boolean
        },
        Agent
      >(
        'PUT',
        [['agent', 'get'], ['organization', 'agents'], ['files']],
        ({agentId}) => `agents/${agentId}`,
        data => {
          if (data.popularQuestions !== undefined) {
            data.agent.popularQuestions = data.popularQuestions.map(value => value.text)
          }
          const formData = new FormData()
          if (data.chatIcon !== undefined) {
            formData.append('chatIcon', data.chatIcon)
          }
          if (data.logo !== undefined) {
            formData.append('logo', data.logo)
          }
          if (data.chatIconDeleted) {
            formData.append('chatIconDeleted', new Blob(['true'], {type: 'application/json'}))
          } else if (data.logoDeleted) {
            formData.append('logoDeleted', new Blob(['true'], {type: 'application/json'}))
          }
          formData.append('agent', new Blob([JSON.stringify(data.agent)], {type: 'application/json'}))
          return formData
        }
      ),
      updateHiddenTags: mutation<{agentId: string; tags: string[]}, Agent>(
        'PUT',
        [['agent', 'get']],
        ({agentId}) => `agents/${agentId}/hiddenTags`,
        ({tags}) => tags
      ),
      delete: mutation<{agentId: string}>(
        'DELETE',
        [['agent'], ['organization', 'agents'], ['organization'], ['agent', 'get']],
        ({agentId}) => `agents/${agentId}`,
        () => undefined
      ),
      configs: {
        api: query<{agentId: string}, AgentApiConfig>(
          'GET',
          ['agent', 'configs', 'api'],
          ({agentId}) => `agents/${agentId}/configs/api`
        ),
        chat: query<{agentId: string}, AgentChatConfig>(
          'GET',
          ['agent', 'configs', 'chat'],
          ({agentId}) => `agents/${agentId}/configs/chat`
        ),
        updateChat: mutation<{agentId: string; data: AgentChatConfig}, AgentChatConfig>(
          'PUT',
          [['agent', 'configs', 'chat']],
          ({agentId}) => `agents/${agentId}/configs/chat`,
          ({data}) => data
        ),
        test: query<{agentId: string; integration: Integration}, string>(
          'GET',
          ['agent', 'configs', 'test'],
          ({agentId, integration}) => `agents/${agentId}/configs/${integration}/test`
        ),
        integration: query<{agentId: string; integration: Integration}, AgentIntegrationConfig>(
          'GET',
          ['agent', 'configs', 'integration'],
          ({agentId, integration}) => `agents/${agentId}/configs/${integration}`
        ),
        updateIntegration: mutation<
          {agentId: string; integration: Integration; data: AgentIntegrationConfig},
          AgentIntegrationConfig
        >(
          'PUT',
          [['agent', 'configs']],
          ({agentId, integration}) => `agents/${agentId}/configs/${integration}`,
          ({data}) => data
        ),
      },
      corpora: query<
        {
          agentId: string
          params?: PaginationParams
        },
        Page<Corpus>
      >(
        'GET',
        ['agent', 'corpora'],
        ({agentId}) => `agents/${agentId}/corpora`,
        ({params}) => ({params})
      ),
      corporaSearch: query<
        {
          agentId: string
          searchRequest?: CorpusSearchRequest
          params?: PaginationParams
        },
        CorpusSearchResponse
      >(
        'POST',
        ['agent', 'corpora'],
        ({agentId}) => `agents/${agentId}/corpora/search`,
        ({params, searchRequest}) => ({params, data: searchRequest ?? {}})
      ),
      docSearch: query<
        {
          agentId: string
          searchRequest?: DocumentSearchRequest
          params?: PaginationParams
        },
        DocumentSearchResponse
      >(
        'POST',
        ['corpora', 'documents'],
        ({agentId}) => `agents/${agentId}/documents/search`,
        ({params, searchRequest}) => ({params, data: searchRequest ?? {}})
      ),
      createCorpus: mutation<{corpus: Corpus; files: FileList}, Corpus>(
        'POST',
        [['agent', 'corpora'], ['corpus']],
        () => 'agents/corpora',
        ({corpus, files}) => {
          const formData = new FormData()
          for (const file of files) {
            formData.append('files', file)
          }
          formData.append('corpus', new Blob([JSON.stringify(corpus)], {type: 'application/json'}))
          return formData
        }
      ),
      feedback: query<{agentId: string; params: PaginationParams; body: FeedbackSearchRequest}, FeedbackSearchResults>(
        'POST',
        ['agent', 'feedback'],
        ({agentId}) => `agents/${agentId}/feedback`,
        ({params, body}) => ({params, data: body})
      ),
      actions: {
        get: query<{agentId: string; params: PaginationParams}, Page<Action>>(
          'GET',
          ['agent', 'actions'],
          ({agentId}) => `agents/${agentId}/actions`,
          ({params}) => ({params})
        ),
        changeSearchStatus: mutation<{changeRequest: ActionChangeSearchStatusRequest}>(
          'PUT',
          [['actions'], ['agent', 'actions']],
          () => 'actions/bulk-search-status-update',
          ({changeRequest}) => changeRequest
        ),
      },
      referenceSets: {
        get: query<{agentId: string; params?: PaginationParams}, Page<ReferenceSet>>(
          'GET',
          ['agent', 'referenceSets'],
          ({agentId}) => `agents/${agentId}/referencesets`,
          ({params}) => ({params})
        ),
        create: mutation<{agentId: string; file: File; referenceSet: ReferenceSet}, ReferenceSet>(
          'POST',
          [['agent', 'referenceSets'], ['referenceset']],
          ({agentId}) => `agents/${agentId}/referencesets`,
          ({file, referenceSet}) => {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('referenceSet', new Blob([JSON.stringify(referenceSet)], {type: 'application/json'}))
            return formData
          }
        ),
      },
      tickets: query<
        {
          agentId: string
          searchRequest?: TicketSearchRequest
          params: PaginationParams
        },
        TicketSearchResults
      >(
        'POST',
        ['agent', 'tickets'],
        ({agentId}) => `agents/${agentId}/tickets`,
        ({params, searchRequest}) => ({params, data: searchRequest ?? {}})
      ),
      ticketInsights: query<
        {
          agentId?: string
          searchRequest: TicketSearchRequest
        },
        TicketInsightsResults
      >(
        'POST',
        ['agent', 'tickets'],
        ({agentId}) => (agentId ? `agents/${agentId}/insights` : 'internal/insights'),
        ({searchRequest}) => ({params: {}, data: searchRequest})
      ),
      ticketInsightsByCategory: query<
        {
          agentId: string
          searchRequest: TicketSearchRequest
          type: TicketInsightsCategory
          params: PaginationParams
        },
        TicketCategoryStat[]
      >(
        'POST',
        ['agent', 'tickets'],
        ({agentId, type}) => `agents/${agentId}/insights/${type as string}`,
        ({searchRequest, params}) => ({
          params: params,
          data: searchRequest,
        })
      ),
      bailout: mutation<
        {
          ticketId: string
          data: BailoutForm
        },
        string
      >(
        'POST',
        [],
        ({ticketId}) => `tickets/${ticketId}/bailout`,
        ({data}) => data
      ),
    },
    corpus: {
      get: query<
        {
          corpusId: string
        },
        Corpus
      >('GET', ['corpus', 'get'], ({corpusId}) => `corpora/${corpusId}`),
      update: mutation<{corpusId: string; data: Corpus}, Corpus>(
        'PUT',
        [['corpus'], ['agent', 'corpora']],
        ({corpusId}) => `corpora/${corpusId}`,
        ({data}) => data
      ),
      delete: mutation<{corpusId: string}>(
        'DELETE',
        [['corpus'], ['agent', 'corpora']],
        ({corpusId}) => `corpora/${corpusId}`,
        () => undefined
      ),
      cancel: mutation<{corpusId: string}>(
        'DELETE',
        [['corpus'], ['agent', 'corpora']],
        ({corpusId}) => `corpora/${corpusId}/cancel`,
        () => undefined
      ),
      crawl: {
        latest: query<{corpusId: string}, Crawl>(
          'GET',
          ['corpus', 'crawl', 'latest'],
          ({corpusId}) => `corpora/${corpusId}/crawl/latest`
        ),
      },
      documents: query<{corpusId: string; params: PaginationParams}, Page<Document>>(
        'GET',
        ['corpus', 'documents'],
        ({corpusId}) => `corpora/${corpusId}/documents`,
        ({params}) => ({params})
      ),
      docSearch: query<
        {
          corpusId: string
          searchRequest?: DocumentSearchRequest
          params?: PaginationParams
        },
        DocumentSearchResponse
      >(
        'POST',
        ['corpus', 'documents'],
        ({corpusId}) => `corpora/${corpusId}/documents/search`,
        ({params, searchRequest}) => ({params, data: searchRequest ?? {}})
      ),
      createDocument: mutation<{corpusId: string; document: Partial<Document>}, Document>(
        'POST',
        [['corpus', 'documents']],
        ({corpusId}) => `corpora/${corpusId}/documents`,
        ({document}) => document
      ),
      refresh: mutation<{corpusId: string}>(
        'POST',
        [['corpus'], ['agent', 'corpora']],
        ({corpusId}) => `corpora/${corpusId}/refresh`,
        () => undefined
      ),
      changeActivation: mutation<{changeRequest: CorpusChangeActivationRequest}>(
        'PUT',
        [['corpus'], ['agent', 'corpora']],
        () => 'corpora/bulk-activation-update',
        ({changeRequest}) => changeRequest
      ),
    },
    inboxitems: {
      all: query<{agentId: string; params: PaginationParams; searchRequest: InboxSearchRequest}, Page<InboxItemDto>>(
        'POST',
        ['inboxitems', 'get'],
        ({agentId}) => `agents/${agentId}/inboxitems`,
        ({params, searchRequest}) => ({params, data: searchRequest})
      ),
      refresh: mutation<{agentId: string}>(
        'POST',
        [['inboxitems']],
        ({agentId}) => `agents/${agentId}/inboxitems/refresh`,
        () => undefined
      ),
      ignore: mutation<{inboxItemId: string}>(
        'POST',
        [['inboxitems']],
        ({inboxItemId}) => `inboxitems/${inboxItemId}/ignore`,
        () => undefined
      ),
      applyfix: mutation<{fixId: string}>(
        'POST',
        [['inboxitems']],
        ({fixId}) => `inboxitems/applyfix/${fixId}`,
        () => undefined
      ),
      fixes: query<{inboxItemId: string}, InboxItemFixDto[]>(
        'GET',
        ['inboxitems', 'get'],
        ({inboxItemId}) => `inboxitems/${inboxItemId}/fixes`
      ),
    },
    users: {
      me: {
        profile: query<undefined, User>('GET', ['profile'], () => 'users/me/profile'),
        permissions: query<undefined, Permission[]>('GET', ['permissions'], () => 'users/me/permissions'),
        experiments: query<undefined, UserExperiments>('GET', ['experiments'], () => 'users/me/experiments'),
      },
    },
    action: {
      get: query<
        {
          actionId: string
        },
        Action
      >('GET', ['action', 'get'], ({actionId}) => `actions/${actionId}`),
      call: mutation<{ticketId: string; actionId: string; data: Object}, string>(
        'POST',
        [],
        ({actionId, ticketId}) => `actions/${actionId}/call/${ticketId}`,
        ({data}) => data
      ),
      updateDescriptionOverride: mutation<{actionId: string; data: Action}, Action>(
        'PUT',
        [['action', 'get']],
        ({actionId}) => `actions/${actionId}/update-description-override`,
        ({data}) => data
      ),
    },
    ticket: {
      get: query<{ticketId: string; params?: {translation_language?: string}}, TicketWithAnalysis>(
        'GET',
        ['ticket', 'get'],
        ({ticketId}) => `tickets/${ticketId}`,
        ({params}) => ({params})
      ),
      followupTickets: query<{ticketId: string}, Ticket[]>(
        'GET',
        ['ticket', 'get', 'followups'],
        ({ticketId}) => `tickets/${ticketId}/followups`
      ),
    },
    ticketMessages: {
      get: query<
        {
          ticketId: string
          params?: {translation_language?: string}
        },
        TicketMessageWithFeedbacks[]
      >(
        'GET',
        ['ticket', 'messages'],
        ({ticketId}) => `tickets/${ticketId}/messages`,
        ({params}) => ({params})
      ),
    },
    referenceSession: {
      get: query<{referenceSessionId: string}, ReferenceSession>(
        'GET',
        ['referencesession', 'get'],
        ({referenceSessionId}) => `referencesessions/${referenceSessionId}`
      ),
      update: mutation<{referenceSessionId: string; data: ReferenceSession}, ReferenceSession>(
        'PUT',
        [
          ['referencesession', 'get'],
          ['referenceset', 'referencesessions'],
        ],
        ({referenceSessionId}) => `referencesessions/${referenceSessionId}`,
        ({data}) => data
      ),
      delete: mutation<{referenceSessionId: string}>(
        'DELETE',
        [['referencesession'], ['referenceset', 'referencesessions']],
        ({referenceSessionId}) => `referencesessions/${referenceSessionId}`,
        () => undefined
      ),
    },
    referenceSet: {
      get: query<{referenceSetId: string}, ReferenceSet>(
        'GET',
        ['referenceset', 'get'],
        ({referenceSetId}) => `referencesets/${referenceSetId}`
      ),
      delete: mutation<{referenceSetId: string}>(
        'DELETE',
        [['referenceset'], ['agent', 'referenceSets']],
        ({referenceSetId}) => `referencesets/${referenceSetId}`,
        () => undefined
      ),
      update: mutation<{referenceSetId: string; data: ReferenceSet}, ReferenceSet>(
        'PUT',
        [['referenceset'], ['agent', 'referenceSets']],
        ({referenceSetId}) => `referencesets/${referenceSetId}`,
        ({data}) => data
      ),
      createReferenceSession: mutation<
        {
          referenceSetId: string
          questions: ReferenceQuestion[]
        },
        ReferenceSession
      >(
        'POST',
        [['referenceset'], ['agent', 'referenceSets']],
        ({referenceSetId}) => `referencesets/${referenceSetId}/referencesessions`,
        ({questions}) => ({questions})
      ),
      evalResultSets: query<
        {
          referenceSetId: string
          params: PaginationParams
        },
        Page<EvalResultSet>
      >(
        'GET',
        ['referenceset', 'evalresultsets'],
        ({referenceSetId}) => `referencesets/${referenceSetId}/evalresultsets`,
        ({params}) => ({params})
      ),
      referenceSessions: query<
        {
          referenceSetId: string
          params?: PaginationParams
        },
        Page<ReferenceSession>
      >(
        'GET',
        ['referenceset', 'referencesessions'],
        ({referenceSetId}) => `referencesets/${referenceSetId}/referencesessions`,
        ({params}) => ({params})
      ),
      runeval: mutation<{referenceSetId: string; data: EvalResultSet}, void>(
        'POST',
        [['referenceset', 'evalresultsets'], ['referenceset']],
        ({referenceSetId}) => `referencesets/${referenceSetId}/runeval`,
        ({data}) => data
      ),
    },
    evalResultSet: {
      get: query<{evalResultSetId: string}, EvalResultSet>(
        'GET',
        ['evalresultset', 'get'],
        ({evalResultSetId}) => `evalresultsets/${evalResultSetId}`
      ),
      evalResults: query<{evalResultSetId: string; params: PaginationParams}, Page<EvalResult>>(
        'GET',
        ['evalresultset', 'evalresults'],
        ({evalResultSetId}) => `evalresultsets/${evalResultSetId}/evalresults`,
        ({params}) => ({params})
      ),
    },
    feedback: {
      get: query<{feedbackId: string}, Feedback>(
        'GET',
        ['feedback', 'get'],
        ({feedbackId}) => `feedback/${feedbackId}`
      ),
    },
    agent_users: {
      all: query<
        {
          agentId: string
          params: PaginationParams
        },
        Page<AgentUserDto>
      >(
        'GET',
        ['internal', 'users', 'all'],
        ({agentId}) => `internal/users/${agentId}/all`,
        ({params}) => ({params})
      ),
      get: query<{agentUserId: string}, AgentUserDto>(
        'GET',
        ['internal', 'users', 'get'],
        ({agentUserId}) => `internal/users/${agentUserId}`
      ),
    },
    internal: {
      agents: query<
        {
          params: PaginationParams & {name?: string; sales?: SalesStatus}
        },
        Page<AgentStats>
      >(
        'GET',
        ['internal', 'agents'],
        () => 'internal/agents',
        ({params}) => ({params})
      ),
      updateAgent: mutation<{agentId: string; data: Agent}, Agent>(
        'PUT',
        [['internal', 'agents']],
        ({agentId}) => `internal/agents/${agentId}`,
        ({data}) => data
      ),
      quickOrgCreate: mutation<{org: QuickOrgCreateDto; popQuestionObjects: {text: string}[]; logo?: File}, Agent>(
        'POST',
        [['internal', 'agents']],
        () => 'internal/quickorg',
        data => {
          data.org.popularQuestions = data.popQuestionObjects.map(value => value.text)
          const formData = new FormData()
          if (data.logo !== undefined) {
            formData.append('logo', data.logo)
          }
          formData.append('org', new Blob([JSON.stringify(data.org)], {type: 'application/json'}))
          return formData
        }
      ),
      orgInsights: mutation<{company: string}, OrgInsightsResponseDto>(
        'GET',
        [],
        () => 'internal/orginsights/',
        () => undefined,
        ({company}) => ({params: {company: company}})
      ),
      migrateCategory: mutation<{
        agentId: string
        categoryToMerge: string
        categoryToKeep: string
      }>(
        'POST',
        [['agent', 'tickets']],
        ({agentId}) => `internal/agents/${agentId}/migrateCategory`,
        ({categoryToMerge, categoryToKeep}) => ({categoryToMerge, categoryToKeep})
      ),
      migrateTickets: mutation<{agentId: string}>(
        'POST',
        [['agent']],
        ({agentId}) => `internal/agents/${agentId}/migrateTickets`,
        () => undefined
      ),
      parseId: {
        get: query<{mavenId: string}, ParsedId>(
          'GET',
          ['internal', 'ids'],
          ({mavenId}) => `internal/ids/parse/${mavenId}`
        ),
        formGet: mutation<{parseMavenId: string}, ParsedId>(
          'GET',
          [['internal', 'ids']],
          ({parseMavenId}) => `internal/ids/parse/${parseMavenId}`,
          () => undefined
        ),
      },
      comparetext: mutation<{string1: string; string2: string}, string>(
        'POST',
        [],
        () => 'internal/comparetext',
        ({string1, string2}) => ({string1, string2})
      ),
      backfill: mutation<
        {
          agentId: string
          integration: Integration
          startTime?: Date
          endTime?: Date
        },
        string
      >(
        'POST',
        [],
        ({agentId, integration}) => `internal/agents/${agentId}/${integration}/backfill`,
        () => null,
        ({startTime, endTime}) => ({
          params: {
            start_time: startTime?.toISOString(),
            end_time: (endTime ? endTime : new Date()).toISOString(),
          },
        })
      ),
    },
    prompts: {
      all: query<
        {params: PaginationParams & {usageContext: string; persona: string; model: string}},
        Page<PromptTemplate>
      >(
        'GET',
        ['prompts', 'all'],
        () => 'prompts',
        ({params}) => ({params})
      ),
      getConfigs: query<void, PromptTemplateConfig>('GET', ['prompt_template_configs'], () => 'prompts/configs'),
      create: mutation<PromptTemplate, PromptTemplate>(
        'POST',
        [['prompts'], ['prompt_template_configs']],
        () => 'prompts',
        data => data
      ),
      activate: mutation<{promptId: string; active: boolean}>(
        'POST',
        [['prompts'], ['prompt_template_configs']],
        ({promptId}) => `prompts/${promptId}/activate`,
        () => undefined,
        ({active}) => ({
          params: {active},
        })
      ),
      seed: mutation<{
        model: LlmModel
        usageContexts: LlmUsageContext[]
        activate: boolean
      }>(
        'POST',
        [['prompts'], ['prompt_template_configs']],
        () => 'prompts/seed',
        () => undefined,
        ({model, usageContexts, activate}) => ({
          params: {model, usageContexts, activate},
        })
      ),
    },
    playground: {
      play: mutation<
        {
          agentId: string
          runRequest: PlaygroundRunRequest
        },
        PlaygroundRunResponse
      >(
        'POST',
        [['agent', 'playground_tickets']],
        ({agentId}) => `agents/${agentId}/playground/play`,
        () => undefined,
        ({runRequest}) => ({params: {}, data: runRequest})
      ),
      tickets: query<
        {
          agentId: string
          searchRequest?: PlaygroundTicketSearchRequest
          params: PaginationParams
        },
        PlaygroundTicketSearchResults
      >(
        'POST',
        ['agent', 'playground_tickets'],
        ({agentId}) => `agents/${agentId}/playground_tickets`,
        ({params, searchRequest}) => ({params, data: searchRequest ?? {}})
      ),
      bulkImport: mutation<{agentId: string; file: File}, {}>(
        'POST',
        [['agent', 'playground_tickets']],
        ({agentId}) => `agents/${agentId}/playground/bulk_import`,
        ({file}) => {
          const formData = new FormData()
          formData.append('file', file)
          return formData
        }
      ),
      getRun: query<{agentId: string; runId: string}, PlaygroundRun>(
        'GET',
        ['playground_run', 'get'],
        ({agentId, runId}) => `agents/${agentId}/playground/runs/${runId}`
      ),
      hide: mutation<{agentId: string; ticketIds: string[]}, void>(
        'DELETE',
        [['agent', 'playground_tickets']],
        ({agentId}) => `agents/${agentId}/playground/bulk_hide`,
        ({ticketIds}) => {
          return {ticketIds: ticketIds ?? []}
        }
      ),
    },
    document: {
      get: query<
        {
          docId: string
        },
        Document
      >('GET', ['document', 'get'], ({docId}) => `document/${docId}?text=true`),
      update: mutation<{docId: string; data: Document}, Document>(
        'PUT',
        [['document'], ['corpus'], ['agent', 'corpora']],
        ({docId}) => `document/${docId}`,
        ({data}) => data
      ),
      updateCorpusPolicy: mutation<{changeRequest: DocumentChangePolicyRequest}>(
        'PUT',
        [['document'], ['corpus'], ['agent', 'corpora']],
        () => 'document/bulk-policy-update',
        ({changeRequest}) => changeRequest
      ),
    },
    ticketMessage: {
      get: query<{ticketMessageId: string}, TicketMessage>(
        'GET',
        ['ticketmessage', 'get'],
        ({ticketMessageId}) => `ticketmessages/${ticketMessageId}`
      ),
      createFeedback: mutation<{ticketMessageId: string; data: Partial<Feedback>}, Feedback>(
        'POST',
        [
          ['agent', 'feedback'],
          ['ticket', 'feedback', 'stats'],
          ['ticket', 'messages'],
        ],
        ({ticketMessageId}) => `ticketmessages/${ticketMessageId}/feedback`,
        ({data}) => data
      ),
    },
    triggers: {
      get: query<{agentId: string; params: PaginationParams}, Page<Trigger>>(
        'GET',
        ['triggers', 'get'],
        ({agentId}) => `agents/${agentId}/triggers`,
        ({params}) => ({params})
      ),
    },
    member: {
      delete: mutation<{memberId: string}>(
        'DELETE',
        [['organization', 'members']],
        ({memberId}) => `members/${memberId}`,
        () => undefined
      ),
      update: mutation<{memberId: string; data: Member}, Member>(
        'PUT',
        [['organization', 'members']],
        ({memberId}) => `members/${memberId}`,
        ({data}) => data
      ),
    },
    status: {
      newrelic: mutation<void, string | undefined>(
        'POST',
        [],
        () => 'status/newrelic',
        () => undefined
      ),
      sentry: mutation<void, string | undefined>(
        'POST',
        [],
        () => 'status/sentry',
        () => undefined
      ),
    },
    nodestatus: {
      newrelic: mutation<void, string | undefined>(
        'POST',
        [],
        () => 'nodestatus/newrelic',
        () => undefined
      ),
      sentry: mutation<void, string | undefined>(
        'POST',
        [],
        () => 'nodestatus/sentry',
        () => undefined
      ),
    },
    integrationSync: mutation<
      {
        agentId: string
        integration: Integration
        ticketId: string
      },
      TicketWithMessages
    >(
      'GET',
      [],
      ({agentId, integration, ticketId}) => `integration/${integration}/agents/${agentId}/tickets/${ticketId}/sync`,
      () => undefined
    ),
    signup: mutation<
      {
        organization: OrgPostDto
        member: Member
        terms: boolean
      },
      OrgGetPutDto
    >(
      'POST',
      [['organization']],
      () => 'signup',
      signup => {
        const formData = new FormData()
        formData.append('organization', new Blob([JSON.stringify(signup.organization)], {type: 'application/json'}))
        formData.append('member', new Blob([JSON.stringify(signup.member)], {type: 'application/json'}))
        return formData
      }
    ),
  }
}
