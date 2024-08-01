'use client'

import React from 'react'

export const DefaultAgentIdContext = React.createContext('')

export const DefaultAgentIdProvider = ({
  children,
  defaultAgentId,
}: React.PropsWithChildren<{defaultAgentId: string}>) => {
  return <DefaultAgentIdContext.Provider value={defaultAgentId}>{children}</DefaultAgentIdContext.Provider>
}
