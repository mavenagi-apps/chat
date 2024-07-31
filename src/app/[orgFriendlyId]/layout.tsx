import {rpc} from '@/rpc/server'
import {type PropsWithChildren} from 'react'
import invariant from 'tiny-invariant'

import {DefaultAgentIdProvider} from './default-agent-id-provider'

export default async function Layout({
  children,
  params: {orgFriendlyId},
}: PropsWithChildren<{
  params: {
    orgFriendlyId: string
  }
}>) {
  const agent = await rpc.organization.getDefaultAgent.fetch({orgFriendlyId})
  invariant(agent?.id, `Organization ${orgFriendlyId} has no agents`)
  return <DefaultAgentIdProvider defaultAgentId={agent.id}>{children}</DefaultAgentIdProvider>
}
