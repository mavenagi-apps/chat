export function getLanguageDisplayName(lang: string) {
  // TODO(fernando): Use org default language once UI is localized
  try {
    lang = normalizeLanguage(lang)
    return new Intl.DisplayNames(['en'], {type: 'language'}).of(lang) || lang
  } catch (error) {
    console.warn(`Error getting display name for language: ${lang}`, error)
    return lang
  }
}

export function sortLanguagesByDisplayName(languages: string[]) {
  return languages.sort((a, b) => getLanguageDisplayName(a).localeCompare(getLanguageDisplayName(b)))
}

export function isEqualLanguage(lang1: string, lang2: string) {
  return normalizeLanguage(lang1) === normalizeLanguage(lang2)
}

function normalizeLanguage(lang: string) {
  return lang.split(/[-_]/, 1)[0].toLowerCase()
}
