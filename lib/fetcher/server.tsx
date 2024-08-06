// 'use server'

// import {getAccessToken} from '@auth0/nextjs-auth0'
// import {cache} from 'react'

// import {Fetcher} from '@magi/fetcher'

// function getCacheImpl() {
//   const value: {fetcher?: Fetcher} = {fetcher: undefined}
//   return value
// }

// let mockCache: ReturnType<typeof getCacheImpl> | undefined
// const getCache = (
//   cache ??
//   (x => {
//     if (!mockCache) {
//       mockCache = x()
//     }
//     return mockCache
//   })
// )(getCacheImpl)

// export async function getFetcher() {
//   let fetcher = getCache().fetcher
//   if (!fetcher) {
//     fetcher = new Fetcher({
//       baseUrl: `${process.env.NEXT_PUBLIC_SPRINGBOOT_API_HOST ?? 'http://api-server:8080'}/api/v1` as const,
//       config: await (async () => {
//         let accessToken: string | undefined
//         try {
//           accessToken = (await getAccessToken()).accessToken
//         } catch (_) {
//           /* empty*/
//         }
//         return {
//           headers: {
//             ...(accessToken && {authorization: `Bearer ${accessToken}`}),
//             ...(process.env.CF_ACCESS_CLIENT_ID && {
//               'cf-access-client-id': process.env.CF_ACCESS_CLIENT_ID,
//             }),
//             ...(process.env.CF_ACCESS_CLIENT_SECRET && {
//               'cf-access-client-secret': process.env.CF_ACCESS_CLIENT_SECRET,
//             }),
//           },
//         }
//       })(),
//     })
//     getCache().fetcher = fetcher
//   }
//   return fetcher
// }
