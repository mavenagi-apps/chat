import { getRequestConfig } from 'next-intl/server';
import { notFound } from 'next/navigation';
import type { AbstractIntlMessages, IntlConfig } from 'use-intl/core';

async function getMessagesUnchecked(locale: string) {
  return await (
    await import(`@/messages/${locale}.json`)
  ).default as AbstractIntlMessages;
}

export async function getMessages(locale: string) {
  try {
    return await getMessagesUnchecked(locale);
  } catch {
    notFound();
  }
}

export default getRequestConfig(async ({ locale }) => {
  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: 'UTC',
  };
}) as RequestConfig | Promise<RequestConfig>;
type RequestConfig = Omit<IntlConfig, 'locale'>;
