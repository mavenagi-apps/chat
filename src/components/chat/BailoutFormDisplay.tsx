import {ReactMarkdown} from '@/components/ReactMarkdown.tsx'
import {rpc} from '@/rpc/react'
import {CheckCircleIcon} from '@heroicons/react/16/solid'
import {useTranslations} from 'next-intl'
import React, {useEffect} from 'react'

import {type Agent, type BailoutForm, BailoutType, FeedbackType} from '@magi/types/data'
import {Alert, AlertDescription, AlertTitle, FieldGroup, Input, Label, Textarea, useForm} from '@magi/ui'

export interface BailoutFormProps {
  showForm?: boolean
  agent: Agent
  message?: string
  ticketId: string
  ticketMessageId: string
}

export default function BailoutFormDisplay({
  showForm = true,
  agent,
  message,
  ticketId,
  ticketMessageId,
}: BailoutFormProps) {
  const t = useTranslations('chat.BailoutFormDisplay')
  const submitBailout = rpc.agent.bailout.useMutation()

  const sendBailoutFeedbackMutation = rpc.ticketMessage.createFeedback.useMutation()

  // Send Handoff feedback every time the bailout form is shown
  useEffect(() => {
    void sendBailoutFeedbackMutation.mutateAsync({
      ticketMessageId,
      data: {
        type: FeedbackType.HANDOFF,
      },
    })
  }, [])

  const {Form, ...methods} = useForm<BailoutForm>({
    onSubmit: data => submitBailout.mutateAsync({ticketId: ticketId, data}),
  })

  return (
    <div className="space-y-4">
      <ReactMarkdown>{message || t('unable_to_answer')}</ReactMarkdown>

      {showForm && agent.bailoutType !== BailoutType.INTEGRATION && (
        <ReactMarkdown linkTargetInNewTab>{agent.bailoutText || t('default_bailout_text')}</ReactMarkdown>
      )}

      {showForm && agent.bailoutType === BailoutType.INTEGRATION && (
        <>
          <p>{t('integration_bailout_text')}</p>

          <Form.Form {...methods}>
            <FieldGroup>
              <div className="grid grid-cols-2 items-stretch gap-2">
                <Form.Field controlId="name">
                  <Label>{t('name')}</Label>
                  <Input required />
                </Form.Field>
                <Form.Field controlId="email">
                  <Label>{t('email')}</Label>
                  <Input required type="email" />
                </Form.Field>
              </div>
              <Form.Field controlId="question">
                <Label>{t('question')}</Label>
                <Textarea rows={2} required />
              </Form.Field>
              {submitBailout.data ? (
                <Alert variant="success">
                  <CheckCircleIcon />
                  <AlertTitle>{t('ticket_created_title')}</AlertTitle>
                  <AlertDescription>{t('ticket_created_description')}</AlertDescription>
                </Alert>
              ) : (
                <Form.SubmitButton variant="secondary">{t('send')}</Form.SubmitButton>
              )}
            </FieldGroup>
          </Form.Form>
        </>
      )}
    </div>
  )
}
