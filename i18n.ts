import { headers } from "next/headers";
import { getRequestConfig } from "next-intl/server";
import type { AbstractIntlMessages, IntlConfig } from "use-intl/core";
import {
  NEXT_LOCALE_HEADER,
  PERMITTED_LOCALES,
} from "./app/constants/internationalization";

// Helper function to get base locale
function getBaseLocale(locale: string): string {
  // Handle cases like 'en-US' -> 'en'
  const baseLocale = locale.split("-")[0].toLowerCase();
  return PERMITTED_LOCALES.includes(
    baseLocale as (typeof PERMITTED_LOCALES)[number],
  )
    ? baseLocale
    : "en";
}

export default getRequestConfig(
  async ({ requestLocale }): Promise<IntlConfig> => {
    try {
      let locale = (await requestLocale) || "en";
      const headersList = await headers();
      const acceptLanguage = headersList.get("accept-language");
      const localeFromUrl = headersList.get(NEXT_LOCALE_HEADER);

      if (localeFromUrl) {
        locale = localeFromUrl;
      } else if (acceptLanguage) {
        // Get the first matching locale from accept-language header
        const matchedLocale = acceptLanguage
          .split(",")
          .map((lang) => lang.split(";")[0].trim()) // Remove quality values
          .find((lang) => PERMITTED_LOCALES.includes(getBaseLocale(lang)));

        if (matchedLocale) {
          locale = getBaseLocale(matchedLocale);
        }
      }

      // Always ensure we use the base locale for file lookup
      const baseLocale = getBaseLocale(locale);

      return {
        locale: baseLocale,
        messages: (await import(`./messages/${baseLocale}.json`))
          .default as AbstractIntlMessages,
      };
    } catch (error) {
      console.error("Error loading locale messages:", error);
      return {
        locale: "en",
        messages: (await import("./messages/en.json"))
          .default as AbstractIntlMessages,
      };
    }
  },
);
