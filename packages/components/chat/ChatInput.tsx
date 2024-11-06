import { Input as HeadlessInput } from "@headlessui/react";
import { useTranslations } from "next-intl";
import React, { type HTMLAttributes } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { z } from "zod";

import { useForm } from "@magi/ui";

import { ChatContext } from "./Chat";

export type ChatInputProps = {
  isSubmitting: boolean;
  questionPlaceholder: string;
} & HTMLAttributes<HTMLInputElement>;

export const ChatInput = ({
  isSubmitting,
  questionPlaceholder,
  ...props
}: ChatInputProps) => {
  const t = useTranslations("chat.ChatInput");
  const { followUpQuestions, ask } = React.useContext(ChatContext);

  const [seeMoreFollowupQuestions, setSeeMoreFollowupQuestions] =
    React.useState<boolean>(false);
  const { Form, ...methods } = useForm({
    schema: z.object({
      question: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1)),
    }),
    onSubmit: async ({ question }) => {
      methods.reset();
      await ask(question);
    },
  });

  return (
    <div className="min-h-14 border-t border-gray-300 bg-white p-3">
      <div className="mx-auto">
        {!isSubmitting && followUpQuestions.length > 0 && (
          <div>
            {followUpQuestions
              .slice(0, seeMoreFollowupQuestions ? 3 : 1)
              .map((question, index) => (
                <div key={index} className="flex w-full flex-col sm:flex-row">
                  <button
                    type="button"
                    className="mb-2 mr-2 flex flex-1 items-center rounded-lg border border-gray-300 bg-white px-3 py-2 text-left text-xs text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-gray-200"
                    onClick={() => {
                      setSeeMoreFollowupQuestions(false);
                      methods.reset();
                      void ask(question);
                    }}
                  >
                    <HiArrowNarrowRight className="mr-2 hidden size-4 sm:block" />
                    {question}
                  </button>
                  {!seeMoreFollowupQuestions &&
                    followUpQuestions.length > 1 && (
                      <button
                        type="button"
                        className="mb-2 mr-2 flex items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                        onClick={() => setSeeMoreFollowupQuestions(true)}
                      >
                        {t("see_more")}
                      </button>
                    )}
                </div>
              ))}
            {seeMoreFollowupQuestions && (
              <button
                type="button"
                className="mb-2 mr-2 items-center rounded-lg border border-gray-300 bg-gray-100 px-3 py-2 text-xs text-gray-900 hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-300"
                onClick={() => setSeeMoreFollowupQuestions(false)}
              >
                {t("see_less")}
              </button>
            )}
          </div>
        )}

        <Form.Form {...methods} className="flex items-center">
          <HeadlessInput
            {...props}
            aria-label={t("aria_question_box")}
            placeholder={t(questionPlaceholder)}
            className="w-0 grow resize-none border-0 p-2 text-xs outline-none focus:shadow-none focus:ring-0"
            {...methods.register("question")}
            autoComplete="off"
          />
          <button
            type="submit"
            aria-label={t("aria_submit_question")}
            disabled={isSubmitting || !methods.formState.isDirty}
            data-testid="submit-question"
            className="focus:ring-primary-300 flex size-7 items-center justify-center rounded-full bg-[--brand-color] bg-gradient-to-r text-xs font-medium text-white hover:bg-gradient-to-br focus:outline-none focus:ring-4"
          >
            <HiArrowNarrowRight className="size-3.5" />
          </button>
        </Form.Form>
      </div>
    </div>
  );
};
