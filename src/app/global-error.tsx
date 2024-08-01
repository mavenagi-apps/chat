'use client'

import {ErrorPage} from '@/components/error-handling'
import {MonitoringHeadScript} from '@/components/monitoring'
import {Inter} from 'next/font/google'
import React from 'react'

import {cn} from '@magi/ui'

import './globals.css'

const font = Inter({subsets: ['latin']})

export default function GlobalError(props: React.ComponentProps<typeof ErrorPage>) {
  return (
    <html>
      <head>
        <MonitoringHeadScript />
      </head>
      <body className={cn(font.className, 'p-4')}>
        <ErrorPage {...props} />
      </body>
    </html>
  )
}
