import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages, IntlConfig } from "use-intl/core";
import {
  NEXT_LOCALE_HEADER,
  ACCEPT_LANGUAGE_HEADER,
  PERMITTED_LOCALES,
  DEFAULT_LOCALE,
  DEFAULT_QUALITY,
  DEFAULT_QUALITY_VALUE,
  ERROR_MESSAGES,
  type PermittedLocale,
} from "./app/constants/internationalization";

// Types
interface LocaleQuality {
  readonly locale: string;
  readonly quality: number;
}

interface LocaleConfig {
  readonly locale: PermittedLocale;
  readonly messages: AbstractIntlMessages;
}

interface RequestConfigParams {
  readonly requestLocale: Promise<string | undefined>;
}

class LocaleError extends Error {
  constructor(
    message: string,
    public readonly locale: string,
  ) {
    super(message);
    this.name = "LocaleError";
  }
}

/**
 * Helper function to get base locale from a locale string
 * Handles cases like 'en-US' -> 'en'
 * @throws {LocaleError} If the locale is invalid
 */
function getBaseLocale(locale: string): PermittedLocale {
  if (!locale) {
    throw new LocaleError(ERROR_MESSAGES.INVALID_LOCALE, locale);
  }

  const baseLocale = locale.split("-")[0].toLowerCase();
  if (PERMITTED_LOCALES.includes(baseLocale as PermittedLocale)) {
    return baseLocale as PermittedLocale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Creates a default locale configuration
 */
async function createDefaultConfig(): Promise<LocaleConfig> {
  return {
    locale: DEFAULT_LOCALE,
    messages: await loadDefaultMessages(),
  };
}

/**
 * Loads messages for a given locale
 * Returns null if messages cannot be loaded
 */
async function loadMessages(
  locale: PermittedLocale,
): Promise<AbstractIntlMessages | null> {
  try {
    const messages = (await import(`./messages/${locale}.json`))
      .default as AbstractIntlMessages;
    return messages || null;
  } catch (error) {
    console.error(
      `${ERROR_MESSAGES.FAILED_TO_LOAD_MESSAGES} ${locale}:`,
      error instanceof Error ? error.message : error,
    );
    return null;
  }
}

/**
 * Loads the default English messages
 * @throws {Error} If default messages cannot be loaded
 */
async function loadDefaultMessages(): Promise<AbstractIntlMessages> {
  try {
    return (await import(`./messages/${DEFAULT_LOCALE}.json`))
      .default as AbstractIntlMessages;
  } catch (error) {
    console.error(
      ERROR_MESSAGES.FAILED_TO_LOAD_DEFAULT,
      error instanceof Error ? error.message : error,
    );
    throw new Error(ERROR_MESSAGES.FAILED_TO_LOAD_DEFAULT);
  }
}

/**
 * Parses accept-language header into sorted locale preferences
 */
function parseAcceptLanguage(acceptLanguage: string): LocaleQuality[] {
  return acceptLanguage
    .split(",")
    .map((lang) => {
      const [locale, quality = DEFAULT_QUALITY] = lang.split(";");
      return {
        locale: getBaseLocale(locale.trim()),
        quality: parseFloat(quality.split("=")[1]) || DEFAULT_QUALITY_VALUE,
      };
    })
    .sort((a, b) => b.quality - a.quality);
}

/**
 * Attempts to load messages for each locale in order until one succeeds
 */
async function tryLocales(
  locales: LocaleQuality[],
): Promise<LocaleConfig | null> {
  for (const { locale } of locales) {
    if (PERMITTED_LOCALES.includes(locale as PermittedLocale)) {
      const messages = await loadMessages(locale as PermittedLocale);
      if (messages) {
        return { locale: locale as PermittedLocale, messages };
      }
    }
  }
  return null;
}

/**
 * Handles the request configuration for internationalization
 */
export const getRequestConfigHandler = async ({
  requestLocale,
}: RequestConfigParams): Promise<IntlConfig> => {
  try {
    let locale = (await requestLocale) || DEFAULT_LOCALE;
    const headersList = await headers();
    const acceptLanguage = headersList.get(ACCEPT_LANGUAGE_HEADER);
    const localeFromUrl = headersList.get(NEXT_LOCALE_HEADER);

    // URL locale takes precedence
    if (localeFromUrl) {
      locale = localeFromUrl;
    } else if (acceptLanguage) {
      const locales = parseAcceptLanguage(acceptLanguage);
      const config = await tryLocales(locales);
      if (config) {
        return config;
      }
    }

    // Handle the requested locale
    const baseLocale = getBaseLocale(locale);
    if (!PERMITTED_LOCALES.includes(baseLocale)) {
      return createDefaultConfig();
    }

    const messages = await loadMessages(baseLocale);
    if (!messages) {
      return createDefaultConfig();
    }

    return {
      locale: baseLocale,
      messages,
    };
  } catch (error) {
    console.error(
      "Error in getRequestConfigHandler:",
      error instanceof Error ? error.message : error,
    );
    return createDefaultConfig();
  }
};

export default getRequestConfig(getRequestConfigHandler);
