import React from 'react'

import {Spinner} from './spinner'

export const Suspense = ({children}: {children: React.ReactNode}) => (
  <React.Suspense fallback={<Spinner />}>{children}</React.Suspense>
)
