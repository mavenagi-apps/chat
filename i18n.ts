import { headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';
import type { AbstractIntlMessages, IntlConfig } from 'use-intl/core';

const PERMITTED_LOCALES = ['en', 'fr', 'es', 'it'];

export default getRequestConfig(async ({ requestLocale }): Promise<IntlConfig> => {
  try {
    let locale = (await requestLocale) || 'en';
    const headersList = await headers();
    const acceptLanguage = headersList.get('accept-language');

    if (acceptLanguage) {
      locale =
        acceptLanguage
          .split(',')
          .find((lang) => PERMITTED_LOCALES.includes(lang)) || locale;
    }

    return {
      locale,
      messages: (await import(`./messages/${locale}.json`)).default as AbstractIntlMessages,
    };
  } catch (error) {
    console.error('Error loading locale messages:', error);
    return {
      locale: 'en',
      messages: (await import('./messages/en.json')).default as AbstractIntlMessages,
    };
  }
});
