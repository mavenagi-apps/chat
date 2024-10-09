import {Input as HeadlessInput} from '@headlessui/react'
import React, {type HTMLAttributes} from 'react'
import {HiArrowNarrowRight} from 'react-icons/hi'
import { RiCustomerService2Line } from 'react-icons/ri';
import {z} from 'zod'

import {useForm} from '@magi/ui'
import {useTranslations} from "next-intl";

export type SalesforceChatInputProps = {
  isSubmitting: boolean
  questionPlaceholder: string
  askFn: (question: string) => Promise<void>
  agentName: string | null
  handleEndChat: () => void
} & HTMLAttributes<HTMLInputElement>

export const SalesforceChatInput = ({
  isSubmitting,
  questionPlaceholder,
  askFn,
  agentName,
  handleEndChat,
  ...props
}: SalesforceChatInputProps) => {
  const {Form, ...methods} = useForm({
    schema: z.object({
      question: z
        .string()
        .transform(v => v.trim())
        .pipe(z.string().min(1)),
    }),
    onSubmit: async ({question}) => {
      methods.reset()
      await askFn(question)
    },
  })
  const t = useTranslations('chat.ChatInput');

  return (
    <div className='min-h-14 border-t border-gray-300 bg-white'>
      <div className='mx-auto'>
        {agentName && (
          <div className='flex justify-between items-center p-3 border-b border-gray-300'>
            <div className='flex items-center space-x-2'>
              <RiCustomerService2Line />
              <h2 className='text-xs text-gray-900'>
                {t('speaking_with_agent')} {agentName}
              </h2>
            </div>
            <button
              onClick={handleEndChat}
              className='bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg'
            >
              {t('end_chat')}
            </button>
          </div>
        )}
        <Form.Form {...methods} className='flex items-center p-3'>
          <HeadlessInput
            {...props}
            aria-label={t('aria_question_box')}
            placeholder={t(questionPlaceholder)}
            className='w-0 grow resize-none border-0 p-2 text-xs outline-none focus:shadow-none focus:ring-0'
            {...methods.register('question')}
            autoComplete='off'
          />
          <button
            type='submit'
            aria-label={t('aria_submit_question')}
            disabled={isSubmitting || !methods.formState.isDirty}
            data-testid='submit-question'
            className='focus:ring-primary-300 flex size-7 items-center justify-center rounded-full bg-[--brand-color] bg-gradient-to-r text-xs font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4'
          >
            <HiArrowNarrowRight className='size-3.5' />
          </button>
        </Form.Form>
      </div>
    </div>
  );
}
