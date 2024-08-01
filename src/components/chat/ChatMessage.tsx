import {ReactMarkdown} from '@/components/ReactMarkdown'
import Spinner from '@/components/Spinner.tsx'
import {rpc} from '@/rpc/react'
import {useTranslations} from 'next-intl'
import React, {useState} from 'react'

import {type TicketMessage} from '@magi/types/data'
import {FieldGroup, Input, Label, useForm} from '@magi/ui'

export interface BotMessageProps {
  message: TicketMessage
  linkTargetInNewTab?: boolean
}

export function UserMessage({text, linkTargetInNewTab = true}: {text: string; linkTargetInNewTab?: boolean}) {
  return (
    <div className="text-xs">
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>{text}</ReactMarkdown>
    </div>
  )
}

export function BotMessage({message, linkTargetInNewTab = true}: BotMessageProps) {
  const t = useTranslations('chat.ChatMessage')
  const action = rpc.action.get.useQuery(
    {actionId: message.botContext.actionId || ''},
    {
      enabled: !!message.botContext.actionId,
    }
  )

  const suggestionsObject = message.botContext.actionParameterSuggestions.reduce((accumulator, suggestion) => {
    return {...accumulator, [suggestion.fieldName]: suggestion.value}
  }, {})

  const [actionResponse, setActionResponse] = useState('')
  const callAction = rpc.action.call.useMutation({
    onSuccess: setActionResponse,
  })

  // TODO(doll): Switch this whole thing to use the platform API
  const {Form, ...methods} = useForm<Object>({
    values: suggestionsObject,
    onSubmit: data =>
      callAction.mutateAsync({actionId: message.botContext.actionId || '', ticketId: message.ticketId, data}),
  })

  return (
    <>
      <div className="prose max-w-full overflow-auto text-xs">
        <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>{message.text}</ReactMarkdown>
      </div>
      {callAction.isIdle && action.data && (
        <div className="flex flex-col gap-4">
          <Form.Form {...methods}>
            <FieldGroup>
              <div className="mt-4 text-lg">{action.data.description || action.data.name}</div>

              {action.data.userFormParameters.map((value, index) => (
                // @ts-expect-error This is a dynamic form, so we can't have a well typed typescript object
                <Form.Field key={index} controlId={value.id} disabled={methods.formState.isSubmitting}>
                  <Label>{value.label || value.description}</Label>
                  <Input />
                </Form.Field>

                // TODO(doll): Support non-string inputs
              ))}

              <Form.SubmitButton>{action.data.buttonName || t('save')}</Form.SubmitButton>
            </FieldGroup>
          </Form.Form>
        </div>
      )}
      {callAction.isPending && <Spinner />}
      {callAction.isSuccess && actionResponse && (
        <div className="py-4">
          <ReactMarkdown linkTargetInNewTab={true}>{actionResponse}</ReactMarkdown>
        </div>
      )}
    </>
  )
}
