// export type FetcherResponse<T> = Omit<Response, 'json'> & {
//   readonly json: () => Promise<T>
// }

// export class FetchError<T> extends Error {
//   response: FetcherResponse<T>

//   constructor(response: FetcherResponse<T>, message?: string) {
//     super(message ?? `${response.status} ${response.statusText}`)
//     this.name = 'FetchError'
//     this.response = response
//   }

//   static async create<T>(response: FetcherResponse<T>): Promise<FetchError<T>> {
//     let text = ''
//     try {
//       text = await response.text()
//       // eslint-disable-next-line no-empty
//     } catch (_) {}
//     return new FetchError(
//       Object.assign(response, {
//         json: async () => JSON.parse(text),
//       }),
//       `${response.status} ${response.statusText}${text ? `: ${text}` : ''}`
//     )
//   }
// }

// export type FetcherConfigBase = Omit<RequestInit, 'method' | 'body'> & {
//   params?:
//     | string
//     | URLSearchParams
//     | Record<string, string | number | boolean | string[] | number[] | boolean[] | null | undefined>
//     | string[][]
//     | undefined
// }
// export type FetcherRequestConfig = FetcherConfigBase & {
//   url: string
// } & (
//     | {
//         method: 'POST' | 'PUT' | 'DELETE' | 'PATCH'
//         body?: RequestInit['body']
//         data?: unknown
//       }
//     | {
//         method: 'GET'
//       }
//   )
// export type FetcherGetConfig = FetcherConfigBase
// export type FetcherPostConfig = FetcherConfigBase & {
//   body?: RequestInit['body']
//   data?: unknown
// }
// export type FetcherPutConfig = FetcherPostConfig
// export type FetcherDeleteConfig = FetcherGetConfig

// export type ExtraFetcherConfig = {
//   headers?: Record<string, string>
// }

// const toFormData = (data: Record<string, string | Blob | Array<string | Blob> | FileList>): FormData => {
//   const formData = new FormData()
//   for (const [key, value] of Object.entries(data)) {
//     if (Array.isArray(value) || value instanceof FileList) {
//       for (const item of value) {
//         formData.append(key, item)
//       }
//     } else {
//       formData.append(key, value)
//     }
//   }
//   return formData
// }

// export class Fetcher {
//   baseUrl: string
//   config?: ExtraFetcherConfig | (() => ExtraFetcherConfig) | (() => Promise<ExtraFetcherConfig>)

//   constructor({
//     baseUrl,
//     config,
//   }: {
//     baseUrl: string
//     config?: ExtraFetcherConfig | (() => ExtraFetcherConfig) | (() => Promise<ExtraFetcherConfig>)
//   }) {
//     if (!baseUrl.endsWith('/')) {
//       baseUrl += '/'
//     }
//     this.baseUrl = baseUrl
//     this.config = config
//   }

//   async request<T>({url, params, ...optionsWithDataBody}: FetcherRequestConfig): Promise<FetcherResponse<T>> {
//     const searchParams = new URLSearchParams(
//       params instanceof URLSearchParams || typeof params === 'string' || params === undefined || Array.isArray(params)
//         ? params
//         : Object.entries(params)
//             .map(([key, value]) =>
//               Array.isArray(value)
//                 ? value.map(v => [key, v.toString()])
//                 : value === null || value === undefined
//                   ? []
//                   : [[key, value.toString()]]
//             )
//             .flat()
//     ).toString()

//     const fullUrl = `${new URL(url, this.baseUrl).toString()}${searchParams ? `?${searchParams}` : ''}`
//     const request = (() => {
//       if (optionsWithDataBody.method === 'GET') {
//         return new Request(fullUrl, optionsWithDataBody)
//       } else {
//         const {body, data, ...options} = optionsWithDataBody
//         const request = new Request(fullUrl, {
//           ...options,
//           body: data !== undefined ? (data instanceof FormData ? data : JSON.stringify(data)) : body,
//         })
//         if (data !== undefined && !(data instanceof FormData)) {
//           request.headers.set('content-type', 'application/json')
//         }
//         return request
//       }
//     })()

//     const extraConfig = this.config instanceof Function ? await this.config() : this.config
//     if (extraConfig?.headers) {
//       for (const [key, value] of Object.entries(extraConfig.headers)) {
//         request.headers.set(key, value)
//       }
//     }
//     const response = (await fetch(request)) as FetcherResponse<T> // & {readonly data: T}
//     if (!response.ok) {
//       throw await FetchError.create(response)
//     }
//     return response
//   }

//   async get<T>(url: string, config?: FetcherGetConfig): Promise<FetcherResponse<T>> {
//     return this.request({method: 'GET', url, ...config})
//   }

//   async post<T>(url: string, data?: unknown, config?: FetcherPostConfig): Promise<FetcherResponse<T>> {
//     return this.request({method: 'POST', url, data, ...config})
//   }
//   async postForm<T>(
//     url: string,
//     data: Parameters<typeof toFormData>[0],
//     config?: FetcherPostConfig
//   ): Promise<FetcherResponse<T>> {
//     return this.post(url, toFormData(data), config)
//   }

//   async put<T>(url: string, data?: unknown, config?: FetcherPutConfig): Promise<FetcherResponse<T>> {
//     return this.request({method: 'PUT', url, data, ...config})
//   }
//   async putForm<T>(
//     url: string,
//     data: Parameters<typeof toFormData>[0],
//     config?: FetcherPutConfig
//   ): Promise<FetcherResponse<T>> {
//     return this.put(url, toFormData(data), config)
//   }

//   async delete<T>(url: string, config?: FetcherDeleteConfig): Promise<FetcherResponse<T>> {
//     return this.request({method: 'DELETE', url, ...config})
//   }
// }
