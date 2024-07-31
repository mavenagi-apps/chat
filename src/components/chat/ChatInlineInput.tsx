import {Input as HeadlessInput} from '@headlessui/react'
import clsx from 'clsx'
import {useTranslations} from 'next-intl'
import React, {type HTMLAttributes} from 'react'
import {HiArrowNarrowRight} from 'react-icons/hi'
import {z} from 'zod'

import {cn, useForm} from '@magi/ui'

import {ChatContext} from './Chat'

export type ChatInputProps = {
  isSubmitting: boolean
  questionPlaceholder: string
  hideInput?: boolean
} & HTMLAttributes<HTMLInputElement>

export const ChatInlineInput = ({isSubmitting, questionPlaceholder, hideInput = false, ...props}: ChatInputProps) => {
  const t = useTranslations('chat.ChatInput')
  const {followUpQuestions, ask} = React.useContext(ChatContext)

  const [seeMoreFollowupQuestions, setSeeMoreFollowupQuestions] = React.useState<boolean>(false)
  const {Form, ...methods} = useForm({
    schema: z.object({
      question: z
        .string()
        .transform(v => v.trim())
        .pipe(z.string().min(1)),
    }),
    onSubmit: async ({question}) => {
      methods.reset()
      await ask(question)
    },
  })

  return (
    <div className="min-h-14 bg-white">
      <div className="mx-auto">
        {followUpQuestions.length > 0 && (
          <div>
            {followUpQuestions.slice(0, seeMoreFollowupQuestions ? 3 : 1).map((question, index) => (
              <div key={index} className="flex w-full flex-col gap-x-2 sm:flex-row">
                <button
                  type="button"
                  disabled={isSubmitting}
                  className="mb-2 flex flex-1 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-xs text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                  onClick={() => {
                    setSeeMoreFollowupQuestions(false)
                    methods.reset()
                    void ask(question)
                  }}
                >
                  <HiArrowNarrowRight className="mr-2 hidden h-4 w-4 sm:block" />
                  {question}
                </button>
                {!seeMoreFollowupQuestions && followUpQuestions.length > 1 && (
                  <button
                    type="button"
                    className="mb-2 flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                    onClick={() => setSeeMoreFollowupQuestions(true)}
                  >
                    {t('see_more')}
                  </button>
                )}
              </div>
            ))}
            {seeMoreFollowupQuestions && (
              <button
                type="button"
                className="mb-2 items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                onClick={() => setSeeMoreFollowupQuestions(false)}
              >
                {t('see_less')}
              </button>
            )}
          </div>
        )}
        {!hideInput && !isSubmitting && (
          <Form.Form {...methods} className="flex items-center">
            <div className="relative w-full">
              <span
                data-slot="control"
                className={cn([
                  'relative block w-full',
                  'before:absolute before:inset-px before:rounded-[calc(theme(borderRadius.lg)-1px)] before:bg-white before:shadow',
                  'dark:before:hidden',
                  'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent sm:after:focus-within:ring-2 sm:after:focus-within:ring-[--brand-color]',
                ])}
              >
                <HeadlessInput
                  aria-label="Question box"
                  placeholder={questionPlaceholder}
                  className={cn([
                    'relative block w-full appearance-none rounded-lg px-[calc(theme(spacing[3])-1px)] py-[calc(theme(spacing[1.5])-1px)] pr-10',
                    'text-xs/6 text-zinc-950 placeholder:text-zinc-500',
                    'border border-[--brand-color]',
                    'bg-transparent dark:bg-white/5',
                    'focus:outline-none',
                  ])}
                  {...methods.register('question')}
                  {...props}
                />
                <div className="absolute right-0 top-0 flex h-full flex-row items-center">
                  <button
                    type="submit"
                    aria-label="Submit question"
                    disabled={isSubmitting}
                    className={clsx('px-4 hover:text-[--brand-color] focus:text-[--brand-color] focus:outline-0')}
                  >
                    <HiArrowNarrowRight className="size-3.5" />
                  </button>
                </div>
              </span>
            </div>
          </Form.Form>
        )}
      </div>
    </div>
  )
}
