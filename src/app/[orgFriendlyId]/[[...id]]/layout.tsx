import {MagiProduct} from '@/lib/analytics/events'
import {rpc} from '@/rpc/server'
import {type Metadata} from 'next'

import Providers from '../../providers'

export async function generateMetadata({
  params: {orgFriendlyId},
}: {
  params: {
    orgFriendlyId: string
  }
}): Promise<Metadata> {
  const org = await rpc.organization.getByFriendlyId.fetch({orgFriendlyId})
  return {
    title: `${org.name} | Chat`,
  }
}

export default function Layout({children}: {children: React.ReactNode}) {
  return <Providers product={MagiProduct.chat}>{children}</Providers>
}
