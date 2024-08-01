import {rpc_} from './shared'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ExtractServerOnlyKeys<T> = T extends {fetch: any}
  ? Pick<T, 'fetch'>
  : {
      [K in keyof T]: ExtractServerOnlyKeys<T[K]>
    }
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const rpc = rpc_(undefined as any) as ExtractServerOnlyKeys<ReturnType<typeof rpc_>>
