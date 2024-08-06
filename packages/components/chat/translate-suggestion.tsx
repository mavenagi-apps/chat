// import type {IntegrationAdapter} from '@/lib/integration/integration-adapter'
// import {useState} from 'react'
// import React from 'react'

// import {type TicketMessage} from '@magi/types/data'

// import {DisplayTranslatedSuggestion} from './display-translated-suggestion'
// import {EditTranslatedSuggestion} from './edit-translated-suggestion'

// type TranslateSuggestionProps = {
//   copyToClipboardFn?: (message: string) => void
//   showSuggestedResponse: (show: boolean) => void
//   updateSuggestedResponse: (suggestedResponse: string) => void
//   botSuggestion: TicketMessage
//   adapter: IntegrationAdapter
//   defaultLanguage: string
// } & React.HTMLAttributes<HTMLDivElement>

// export const TranslateSuggestion = function ({
//   copyToClipboardFn = message => navigator.clipboard.writeText(message),
//   ...props
// }: TranslateSuggestionProps) {
//   const {adapter, defaultLanguage, botSuggestion, showSuggestedResponse, updateSuggestedResponse} = props

//   const [isEditing, setIsEditing] = useState(false)
//   const [translatedText, setTranslatedText] = useState('')

//   async function translateTextFn(request: TranslateRequest): Promise<string> {
//     const response = await adapter.proxyFetch<String>(`integration/${adapter.type.toLowerCase()}/translate`, {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       data: {
//         text: request.text,
//         target_language: request.targetLanguage,
//       },
//     })
//     return response.text()
//   }

//   showSuggestedResponse(!isEditing)

//   return (
//     <>
//       {isEditing ? (
//         <EditTranslatedSuggestion
//           translateTextFn={translateTextFn}
//           setIsEditing={setIsEditing}
//           updateSuggestedResponse={updateSuggestedResponse}
//           translatedText={translatedText}
//           targetLanguage={botSuggestion.language?.code || defaultLanguage}
//         />
//       ) : (
//         <DisplayTranslatedSuggestion
//           translateTextFn={translateTextFn}
//           defaultLanguage={defaultLanguage}
//           botSuggestion={botSuggestion}
//           copyToClipboardFn={copyToClipboardFn}
//           setIsEditing={setIsEditing}
//           translatedText={translatedText}
//           setTranslatedText={setTranslatedText}
//         />
//       )}
//     </>
//   )
// }

// export type TranslateRequest = {
//   text: string
//   targetLanguage: string
// }
