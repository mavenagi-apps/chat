'use client'

import {useFetcher} from '@/lib/fetcher/react'
import {
  type SuspenseQueriesOptions,
  type UseSuspenseQueryOptions,
  useQueries,
  useSuspenseQueries,
} from '@tanstack/react-query'

import {rpc_} from './shared'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractOnlyReactKeys<T> = T extends {useQuery: any; useSuspenseQuery: any}
  ? Pick<T, 'useQuery' | 'useSuspenseQuery'>
  : // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends {useMutation: any}
    ? Pick<T, 'useMutation'>
    : {
        [K in keyof T]: ExtractOnlyReactKeys<T[K]>
      }
type ExtractQueryOptionsFn<T> = T extends (...args: infer Args) => infer R
  ? (...args: Args) => R
  : {
      [K in keyof T]: T[K] extends object ? ExtractQueryOptionsFn<T[K]> : T[K]
    }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rpc = Object.assign(rpc_(undefined as any) as ExtractOnlyReactKeys<ReturnType<typeof rpc_>>, {
  useQueries,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useSuspenseQueries: <TQueryOptions extends Omit<UseSuspenseQueryOptions<any, any, any, any>, 'queryKey'>[]>(
    queriesCallback: (
      t: ExtractQueryOptionsFn<ReturnType<typeof rpc_>>
    ) => readonly [...SuspenseQueriesOptions<TQueryOptions>]
  ) => {
    const queries = queriesCallback(rpc_(useFetcher()))
    return useSuspenseQueries({
      queries,
    })
  },
})
