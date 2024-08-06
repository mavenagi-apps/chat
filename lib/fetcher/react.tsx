// 'use client'

// import {createContext, useContext} from 'react'
// import invariant from 'tiny-invariant'

// import {type Fetcher} from '@magi/fetcher'

// const FetcherContext = createContext<Fetcher | undefined>(undefined)
// export const FetcherProvider = ({fetcher, children}: {fetcher: Fetcher; children: React.ReactNode}) => {
//   return <FetcherContext.Provider value={fetcher}>{children}</FetcherContext.Provider>
// }
// export const useFetcher = () => {
//   const fetcher = useContext(FetcherContext)
//   invariant(fetcher, 'useFetcher must be used within a FetcherProvider')
//   return fetcher
// }
