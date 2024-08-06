// import {ReactMarkdown} from '@/components/ReactMarkdown'
// import {getLanguageDisplayName, isEqualLanguage, sortLanguagesByDisplayName} from '@/lib/language-utils'
// import {Disclosure} from '@headlessui/react'
// import {useTranslations} from 'next-intl'
// import React, {useEffect, useState} from 'react'
// import {LuCopy, LuPenSquare} from 'react-icons/lu'

// import {SupportedLanguages, type TicketMessage} from '@magi/types/data'
// import {Select, Text} from '@magi/ui'

// import {ButtonGroup} from '../button-group'
// import {type TranslateRequest} from './translate-suggestion'

// type DisplayTranslatedSuggestionProps = {
//   defaultLanguage: string
//   botSuggestion: TicketMessage
//   copyToClipboardFn?: (message: string) => void
//   setIsEditing: (isEditing: boolean) => void
//   translateTextFn: (request: TranslateRequest) => Promise<string>
//   translatedText: string
//   setTranslatedText: (text: string) => void
// }

// export const DisplayTranslatedSuggestion = function ({
//   copyToClipboardFn = message => navigator.clipboard.writeText(message),
//   botSuggestion,
//   defaultLanguage,
//   setIsEditing,
//   translateTextFn,
//   translatedText,
//   setTranslatedText,
// }: DisplayTranslatedSuggestionProps) {
//   const t = useTranslations('chat.DisplayTranslatedSuggestion')

//   const [translationLanguage, setTranslationLanguage] = useState(defaultLanguage)

//   async function fetchTranslation(language: string) {
//     const result = await translateTextFn({
//       text: botSuggestion.text,
//       targetLanguage: language,
//     })
//     setTranslatedText(result)
//   }

//   useEffect(() => {
//     const fetchData = async () => {
//       await fetchTranslation(translationLanguage)
//     }

//     void fetchData()
//   }, [translationLanguage])

//   return (
//     <div className="w-full border-t border-gray-200 pt-4">
//       <Text className="mb-2 text-base text-sm font-normal text-gray-400">{t('translate_to')}</Text>

//       <Select
//         data-testid="translate-language-selector"
//         className="mb-6"
//         defaultValue={translationLanguage}
//         value={translationLanguage}
//         onChange={e => setTranslationLanguage(e.target.value)}
//         required
//       >
//         {sortLanguagesByDisplayName(Object.values(SupportedLanguages))
//           .filter(lang => !isEqualLanguage(lang, botSuggestion.language?.code || ''))
//           .map(lang => (
//             <option value={lang} key={lang}>
//               {getLanguageDisplayName(lang)}
//             </option>
//           ))}
//       </Select>

//       <Disclosure defaultOpen>
//         {({open}) => {
//           return (
//             <>
//               <Disclosure.Panel>
//                 <div
//                   className="prose mb-4 max-w-full overflow-auto text-xs"
//                   dir="auto"
//                   data-testid="translatedSuggestion"
//                 >
//                   <ReactMarkdown>{translatedText || t('loading')}</ReactMarkdown>
//                 </div>
//               </Disclosure.Panel>

//               <Disclosure.Button className="text-fg-brand flex flex-shrink-0 items-center gap-1 text-xs">
//                 {open ? t('hide_translation') : t('show_translation')}
//               </Disclosure.Button>
//             </>
//           )
//         }}
//       </Disclosure>

//       <div className="flex justify-end">
//         <div className="relative flex flex-wrap justify-end gap-x-4 gap-y-2">
//           <ButtonGroup className="relative">
//             <button type="button" onClick={() => setIsEditing(true)}>
//               <LuPenSquare title={t('edit_suggestion')} />
//             </button>
//             <button type="button" onClick={() => copyToClipboardFn(translatedText)}>
//               <LuCopy title={t('copy_to_clipboard')} />
//             </button>
//           </ButtonGroup>
//         </div>
//       </div>
//     </div>
//   )
// }
