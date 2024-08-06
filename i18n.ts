import {getRequestConfig} from 'next-intl/server'
import {cookies} from 'next/headers'
import {notFound} from 'next/navigation'
import type {IntlConfig} from 'use-intl/core'

async function getMessagesUnchecked(locale: string) {
  return await (
    await import(`@/messages/${locale}.json`)
  ).default
}

export async function getMessages(locale: string) {
  try {
    return await getMessagesUnchecked(locale)
  } catch {
    notFound()
  }
}

export default getRequestConfig(async ({locale}) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: cookies().get('tz')?.value || 'UTC',
  }
}) as RequestConfig | Promise<RequestConfig>
type RequestConfig = Omit<IntlConfig, 'locale'>
