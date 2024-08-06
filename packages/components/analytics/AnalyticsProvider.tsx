'use client'

import {Analytics} from '@/lib/analytics'
import {type MagiProduct} from '@/lib/analytics/events'
import React, {useEffect} from 'react'

export function AnalyticsProvider({
  children,
  product,
  userId,
  email,
}: {
  children: React.ReactNode
  product: MagiProduct
  userId?: string
  email?: string
}) {
  useEffect(() => {
    const analytics = Analytics.getInstance()
    analytics.init(product, userId === 'anonymous' ? undefined : userId, email)
  }, [product, userId])
  return <>{children}</>
}
