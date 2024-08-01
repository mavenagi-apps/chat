import {useMutation} from '@tanstack/react-query'
import {useTranslations} from 'next-intl'
import React from 'react'

import {useForm} from '@magi/ui'
import {Button, Input, Textarea} from '@magi/ui'

import {type TranslateRequest} from './translate-suggestion'

type EditTranslatedSuggestionProps = {
  translatedText: string
  targetLanguage: string
  setIsEditing: (isEditing: boolean) => void
  updateSuggestedResponse: (suggestedResponse: string) => void
  translateTextFn: (request: TranslateRequest) => Promise<string>
}

export const EditTranslatedSuggestion = ({
  translatedText,
  targetLanguage,
  setIsEditing,
  updateSuggestedResponse,
  translateTextFn,
}: EditTranslatedSuggestionProps) => {
  const t = useTranslations('chat.EditTranslatedSuggestion')

  const {Form, ...methods} = useForm<TranslateRequest>({
    onSubmit: data => {
      return translateMutation.mutateAsync(data).then(result => {
        updateSuggestedResponse(result)
        setIsEditing(false)
      })
    },
    defaultValues: {
      text: translatedText,
      targetLanguage: targetLanguage,
    },
  })

  const translateMutation = useMutation({
    mutationFn: translateTextFn,
  })

  return (
    <div className="w-full pt-4">
      <h5 className="mb-4 font-semibold text-gray-900">{t('title')}</h5>
      <Form.Form {...methods}>
        <Form.Field controlId="text">
          <Textarea rows={6} className="mb-4" data-testid="editSuggestionBox" />
        </Form.Field>
        <Form.Field controlId="targetLanguage" hidden>
          <Input type="hidden" value={targetLanguage} />
        </Form.Field>
        <div className="relative flex flex-wrap justify-end gap-x-4 gap-y-2">
          <Button variant="secondary" onClick={() => setIsEditing(false)}>
            {t('cancel')}
          </Button>
          <Form.SubmitButton>{t('translate')}</Form.SubmitButton>
        </div>
      </Form.Form>
    </div>
  )
}
