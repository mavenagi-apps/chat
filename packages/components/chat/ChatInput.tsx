import { Input as HeadlessInput } from "@headlessui/react";
import { useTranslations } from "next-intl";
import React, { type HTMLAttributes, useState, useMemo } from "react";
import { HiArrowNarrowRight } from "react-icons/hi";
import { RiAttachmentLine, RiCustomerService2Line } from "react-icons/ri";
import { z } from "zod";

import { useForm } from "@magi/ui";

import { ChatContext } from "./Chat";
import Chip from "@magi/components/chat/Chip";
import { Attachment } from "mavenagi/api";

const HandoffChatBar = () => {
  const t = useTranslations("chat.ChatInput");
  const { agentName, handleEndHandoff } = React.useContext(ChatContext);
  return (
    <div className="flex justify-between items-center p-3 border-b border-gray-300">
      <div className="flex items-center space-x-2">
        <RiCustomerService2Line />
        <h2 className="text-xs text-gray-900">
          {t("speaking_with_agent")} {agentName}
        </h2>
      </div>
      <button
        onClick={handleEndHandoff}
        className="bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded-lg"
      >
        {t("end_chat")}
      </button>
    </div>
  );
};

type ChatInputProps = {
  isSubmitting: boolean;
  questionPlaceholder: string;
} & HTMLAttributes<HTMLInputElement>;

export const ChatInput = ({
  isSubmitting,
  questionPlaceholder,
  ...props
}: ChatInputProps) => {
  const t = useTranslations("chat.ChatInput");
  const {
    followUpQuestions,
    ask,
    isHandoff,
    shouldSupressHandoffInputDisplay,
  } = React.useContext(ChatContext);

  const [seeMoreFollowupQuestions, setSeeMoreFollowupQuestions] =
    React.useState<boolean>(false);

  async function fileToAttachment(file: File): Promise<Attachment> {
    const mimeType = file.type;
    const base64content = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

    return {
      type: mimeType,
      content: base64content.split(",")[1], // Remove the data URL prefix
    };
  }

  const { Form, ...methods } = useForm({
    schema: z.object({
      question: z
        .string()
        .transform((v) => v.trim())
        .pipe(z.string().min(1)),
      files: z.instanceof(FileList).optional(),
    }),
    onSubmit: async ({ question, files }) => {
      const attachments: Attachment[] = [];
      if (files && files.length > 0) {
        attachments.push(await fileToAttachment(files[0]));
      }
      await ask(question, attachments);
      methods.reset();
    },
  });

  const allowedAttachmentTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ];

  //TODO to be used to add visual feedback to drag and drop
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver: React.DragEventHandler<HTMLDivElement> = (
    event: React.DragEvent,
  ) => {
    event.preventDefault();
    setIsDragging(true);
  };

  function handleDragLeave() {
    setIsDragging(false);
  }

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (
    event: React.DragEvent,
  ) => {
    event.preventDefault();
    setIsDragging(false);
    const files: FileList = event.dataTransfer.files;
    if (files.length > 0 && allowedAttachmentTypes.includes(files[0].type)) {
      methods.setValue("files", files);
    }
  };
  const showHandoffInput = useMemo(() => {
    if (!isHandoff) {
      return false;
    }

    return !shouldSupressHandoffInputDisplay;
  }, [isHandoff, shouldSupressHandoffInputDisplay]);

  return (
    <div className="min-h-14 border-t border-gray-300 bg-white p-3">
      <div className="mx-auto">
        {showHandoffInput && <HandoffChatBar />}
        {!showHandoffInput && !isSubmitting && followUpQuestions.length > 0 && (
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

        <div
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragLeave={handleDragLeave}
        >
          <Form.Form {...methods} className="flex items-center relative">
            <HeadlessInput
              {...props}
              aria-label={t("aria_question_box")}
              placeholder={t(questionPlaceholder)}
              className="w-0 grow resize-none border-0 p-2 text-xs outline-none focus:shadow-none focus:ring-0"
              {...methods.register("question")}
              autoComplete="off"
              data-testid="chat-input"
            />
            <input
              type="file"
              id="file-input"
              className="hidden"
              accept={allowedAttachmentTypes.join(",")}
              {...methods.register("files")}
            />
            {methods.watch("files")?.[0] &&
              Chip({
                displayText: methods.getValues("files")![0].name,
                onRemove: () => methods.resetField("files"),
              })}
            <label htmlFor="file-input" className="cursor-pointer">
              <RiAttachmentLine className="size-5 text-gray-500 hover:text-gray-700 mr-2" />
            </label>
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
    </div>
  );
};
