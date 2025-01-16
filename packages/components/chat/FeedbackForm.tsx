import { useTranslations } from "next-intl";
import * as React from "react";
import { LuCopy, LuThumbsDown, LuThumbsUp } from "react-icons/lu";
import { toast } from "sonner";
import { z } from "zod";

import { createOrUpdateFeedback } from "@/app/actions";
import { Textarea, useForm } from "@magi/ui";
import {
  FeedbackType as MavenFeedbackType,
  type FeedbackType,
  type Feedback,
  type BotMessage,
  type BotResponse,
} from "mavenagi/api";
import { MagiEvent } from "@/lib/analytics/events";
import { useAnalytics } from "@/lib/use-analytics";

import { ButtonGroup } from "../button-group";

function isBotTextResponse(
  response: BotResponse,
): response is BotResponse.Text {
  return response.type === "text";
}

type PartialFeedbackType = Partial<FeedbackType>;

type Props = {
  message: BotMessage;
  showClipboardButton?: boolean;
  showBailoutButton?: boolean;
  conversationId: string;
  mavenUserId: string | null;
  copyToClipboardFn?: (message: string) => void;
} & React.HTMLAttributes<HTMLDivElement>;

type SuccessResponse = string;

type ErrorResponse = {
  error: string;
};

type ResponseType = SuccessResponse | ErrorResponse;

function isErrorResponse(response: ResponseType): response is ErrorResponse {
  return typeof response === "object" && "error" in response;
}

export default function FeedbackForm({
  message,
  conversationId,
  children,
  showClipboardButton = true,
  mavenUserId,
  copyToClipboardFn = (message) => navigator.clipboard.writeText(message),
  ...props
}: Props) {
  const t = useTranslations("chat.FeedbackForm");
  const analytics = useAnalytics();
  const [feedbackId, setFeedbackId] = React.useState<string | undefined>(
    undefined,
  );
  const [feedbackType, setFeedbackType] = React.useState<
    PartialFeedbackType | undefined
  >();
  const [feedbackTextFormShown, setFeedbackTextFormShown] =
    React.useState<boolean>(false);
  const [feedbackFormDisabled, setFeedbackFormDisabled] =
    React.useState<boolean>(false);

  const { Form, ...methods } = useForm({
    schema: z.object({
      text: z.string().min(1),
    }),
    onSubmit: async (data) => {
      await submitFeedback({ text: data.text });
    },
  });

  const submitFeedback = async (
    feedback: Partial<Feedback>,
    event?: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    setFeedbackFormDisabled(true);
    if (event) {
      (event.target as HTMLButtonElement).blur();
    }

    const rollbackFeedbackType = feedbackType;
    if (feedback.type) {
      setFeedbackType(feedback.type);
    }

    const response = (await createOrUpdateFeedback({
      organizationId: message.conversationMessageId.organizationId,
      agentId: message.conversationMessageId.agentId,
      feedbackId: feedbackId || "",
      conversationId: conversationId,
      conversationMessageId: message.conversationMessageId.referenceId,
      feedbackType: feedback.type || feedbackType,
      feedbackText: feedback.text,
      userId: mavenUserId || "",
    })) as ResponseType;

    if (isErrorResponse(response)) {
      toast.error("Error submitting feedback.");
      if (feedback.type) {
        setFeedbackType(rollbackFeedbackType);
      }
    } else {
      methods.reset();
      setFeedbackId(response);
      toast.success("Thanks for your feedback!");
      setFeedbackTextFormShown(!feedback.text);
      analytics.logEvent(MagiEvent.feedbackSubmit, {
        agentId: message.conversationMessageId.agentId,
        conversationId: conversationId,
        conversationMessageId: message.conversationMessageId.referenceId,
        feedbackType: feedback.type || feedbackType,
        feedbackText: feedback.text,
      });
    }

    setFeedbackFormDisabled(false);
  };

  const buttonsContainerRef = React.useRef<HTMLDivElement>(null);
  const thumbsUpRef = React.useRef<HTMLButtonElement>(null);
  const thumbsDownRef = React.useRef<HTMLButtonElement>(null);

  function getMessageText() {
    return (
      message.responses
        .filter(isBotTextResponse) // Use the type guard
        .map((response) => response.text || "")
        .join("") || ""
    );
  }

  return (
    <div {...props}>
      <div className="flex justify-end">
        <div
          className="relative flex flex-wrap justify-end gap-x-4 gap-y-2"
          ref={buttonsContainerRef}
        >
          <ButtonGroup className="relative">
            <button
              type="button"
              ref={thumbsUpRef}
              {...(feedbackType === MavenFeedbackType.ThumbsUp
                ? { "data-active": "" }
                : {})}
              onClick={(e) =>
                submitFeedback({ type: MavenFeedbackType.ThumbsUp }, e)
              }
            >
              <LuThumbsUp title={t("thumbs_up")} />
            </button>
            <button
              type="button"
              ref={thumbsDownRef}
              {...(feedbackType === MavenFeedbackType.ThumbsDown
                ? { "data-active": "" }
                : {})}
              onClick={(e) =>
                submitFeedback({ type: MavenFeedbackType.ThumbsDown }, e)
              }
            >
              <LuThumbsDown title={t("thumbs_down")} />
            </button>
            {showClipboardButton && (
              <button
                type="button"
                onClick={() => {
                  copyToClipboardFn(getMessageText());
                  toast(t("copied_to_clipboard"));
                }}
              >
                <LuCopy title={t("copy_to_clipboard")} />
              </button>
            )}
          </ButtonGroup>
          {children}
        </div>
      </div>

      {feedbackTextFormShown && (
        <div className="relative mt-4 rounded-lg border border-gray-200 text-xs shadow-sm">
          <div
            className="absolute"
            style={{
              right:
                buttonsContainerRef.current !== null &&
                thumbsUpRef.current !== null &&
                thumbsDownRef.current !== null
                  ? buttonsContainerRef.current.offsetWidth +
                    4 -
                    (feedbackType === MavenFeedbackType.ThumbsUp
                      ? thumbsUpRef.current.offsetLeft +
                        thumbsUpRef.current.offsetWidth / 2
                      : thumbsDownRef.current.offsetLeft +
                        thumbsDownRef.current.offsetWidth / 2)
                  : "-9999px",
              top: "-6px",
            }}
          >
            <div
              className="absolute border-b border-r border-gray-200 bg-white"
              style={{
                transform: "rotate(-135deg)",
                height: "11px",
                width: "11px",
              }}
            />
          </div>

          {feedbackTextFormShown && (
            <>
              <div className="rounded-t-lg border-b border-gray-200 px-3 py-2">
                <h3 className="font-semibold">{t("feedback_reason")}</h3>
              </div>
              <div className="px-3 py-2">
                <Form.Form {...methods} className="grid gap-y-2">
                  <Form.Field controlId="text">
                    <Textarea
                      className="text-xs dark:text-gray-800"
                      placeholder={
                        feedbackType === MavenFeedbackType.ThumbsDown
                          ? t("down_placeholder")
                          : t("up_placeholder")
                      }
                      disabled={feedbackFormDisabled}
                    />
                  </Form.Field>
                  <div>
                    <Form.SubmitButton
                      variant="secondary"
                      isProcessing={feedbackFormDisabled}
                      type="submit"
                      className="float-right"
                    >
                      {t("submit")}
                    </Form.SubmitButton>
                  </div>
                </Form.Form>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
