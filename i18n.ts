import { headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages, IntlConfig } from 'use-intl/core';

const PERMITTED_LOCALES = ['en', 'en-US', 'fr', 'es', 'it'];

export default getRequestConfig(async ({ requestLocale }): Promise<IntlConfig> => {
  let locale = (await requestLocale) || 'en-US';
  const headersList = await headers();
  const acceptLanguage = headersList.get('accept-language');

  if (acceptLanguage) {
    locale = acceptLanguage.split(',').find((lang) => PERMITTED_LOCALES.includes(lang)) || 'en-US';
  }

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default as AbstractIntlMessages,
  };
});
