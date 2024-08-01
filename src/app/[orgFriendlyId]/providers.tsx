'use client'

import Spinner from '@/components/Spinner'
import {AnalyticsProvider} from '@/components/analytics/AnalyticsProvider'
import {type MagiProduct} from '@/lib/analytics/events'
import {rpc} from '@/rpc/react'
import {Suspense} from 'react'

export default function Providers({product, children}: {product: MagiProduct; children: React.ReactNode}) {
  const profile = rpc.users.me.profile.useQuery(undefined)

  return (
    <AnalyticsProvider product={product} userId={profile.data?.id} email={profile.data?.email}>
      <Suspense fallback={<Spinner />}>{children}</Suspense>
    </AnalyticsProvider>
  )
}
