// Header constants
export const NEXT_LOCALE_HEADER = "x-next-intl-locale" as const;
export const ACCEPT_LANGUAGE_HEADER = "accept-language" as const;

// Locale configuration
export const PERMITTED_LOCALES = ["en", "fr", "es", "it", "de", "pt"] as const;
export type PermittedLocale = (typeof PERMITTED_LOCALES)[number];

// Default values
export const DEFAULT_LOCALE = "en" as const;
export const DEFAULT_QUALITY = "q=1.0" as const;
export const DEFAULT_QUALITY_VALUE = 1.0 as const;

// Error messages
export const ERROR_MESSAGES = {
  INVALID_LOCALE: "Invalid locale provided",
  FAILED_TO_LOAD_MESSAGES: "Failed to load messages for locale",
  FAILED_TO_LOAD_DEFAULT: "Failed to load default English messages",
} as const;
