import React, { useMemo } from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { ReactMarkdown } from "@magi/components/ReactMarkdown";
import { ChatBubble } from "@magi/components/chat/ChatCard";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import FeedbackForm from "@magi/components/chat/FeedbackForm";
import BailoutFormDisplay from "@magi/components/chat/BailoutFormDisplay";
import EscalationFormDisplay from "@magi/components/chat/EscalationFormDisplay";
import { showBotAnswer } from "@/src/lib/chat/chat-helpers";
import {
  type ActionChatMessage,
  isActionChatMessage,
  isBotMessage,
  isEscalationChatMessage,
  type Message,
  type UserChatMessage,
  type ZendeskWebhookMessage,
  type SalesforceChatMessage,
  type IncomingHandoffConnectionEvent,
  type QueueUpdateMessage,
  type CombinedMessage,
} from "@/src/types";
import type { Attachment, ConversationMessageResponse } from "mavenagi/api";
import { useTranslations } from "next-intl";
import type { Front } from "@/src/types/front";
import { SALESFORCE_MESSAGE_TYPES } from "@/src/types/salesforce";
import type { UseChatResponse } from "./use-chat";

interface MessageProps {
  message: CombinedMessage;
  linkTargetInNewTab?: boolean;
  conversationId?: string;
  initialUserChatMessage?: UserChatMessage | null;
  mavenUserId: string | null;
  onBailoutFormSubmitSuccess: UseChatResponse["onBailoutFormSubmitSuccess"];
}

function MessageCharts({
  message,
}: {
  message: ConversationMessageResponse.Bot;
}) {
  const t = useTranslations("chat.ChatPage");
  return message.responses
    .filter((r) => r.type === "chart")
    .map((chart, index) => {
      try {
        if (chart.specSchema !== "HIGHCHARTS_TS") {
          return null;
        }

        const chartOptions = JSON.parse(chart.spec);
        return (
          <div key={index} id={`chart-${index}`}>
            <HighchartsReact highcharts={Highcharts} options={chartOptions} />
          </div>
        );
      } catch (e) {
        console.error(`Error rendering chart ${index}`, e);
        return (
          <div className="text-xs text-red-500">
            {t("error_rendering_chart")}
          </div>
        );
      }
    });
}

function renderHandoffMessage(message: ZendeskWebhookMessage) {
  const author = message.payload.message?.author?.displayName;
  return (
    <ChatBubble direction="left-hug" author={author}>
      <ReactMarkdown linkTargetInNewTab={true}>
        {message.payload.message?.content?.text || ""}
      </ReactMarkdown>
    </ChatBubble>
  );
}

function renderSalesforceMessage(message: SalesforceChatMessage) {
  const author = message.message.name;
  return (
    <ChatBubble direction="left-hug" author={author}>
      <ReactMarkdown linkTargetInNewTab={true}>
        {message.message.text}
      </ReactMarkdown>
    </ChatBubble>
  );
}

function renderFrontAgentMessage(message: Front.WebhookMessage) {
  const author = message.author
    ? `${message.author.first_name} ${message.author.last_name}`.trim()
    : undefined;
  return (
    <ChatBubble direction="left-hug" author={author}>
      <ReactMarkdown linkTargetInNewTab={true}>
        {message.body || ""}
      </ReactMarkdown>
    </ChatBubble>
  );
}

function getHandoffEventMessageText(
  message: IncomingHandoffConnectionEvent,
  t: ReturnType<typeof useTranslations>,
): string | null {
  const messageMap = {
    ChatConnecting: () => t("connecting_to_agent"),
    ChatEstablished: () => t("connected_to_agent"),
    ChatRequestFail: () => t("salesforce_chat_request_fail_unavailable"),
    ChatEnded: () => t("chat_has_ended"),
    ChatTransferred: (message: IncomingHandoffConnectionEvent) => {
      const agentName =
        "message" in message && "name" in message.message
          ? message.message.name
          : undefined;
      return t("chat_transferred", { name: agentName });
    },
    QueueUpdate: (message: QueueUpdateMessage) => {
      const { estimatedWaitTime, position } = message.message;

      if (estimatedWaitTime && estimatedWaitTime > -1) {
        return t("chat_queue_position_estimated_wait_time", {
          estimatedWaitTime,
        });
      }

      if (position === 0) {
        return t("chat_queue_position_next");
      }

      if (position && position > 0) {
        return t("chat_queue_position_in_queue", { position });
      }

      return t("chat_queue_position_in_queue");
    },
  };
  const messageText = messageMap[message.type as keyof typeof messageMap]?.(
    message as QueueUpdateMessage,
  );
  return messageText || null;
}

function renderHandoffEventMessage(
  message: IncomingHandoffConnectionEvent,
  t: ReturnType<typeof useTranslations>,
) {
  const messageText = getHandoffEventMessageText(message, t);
  if (!messageText) {
    return null;
  }

  return (
    <div className="my-5 flex items-center justify-center h-auto text-gray-500">
      <div className="grow border-t border-gray-300"></div>
      <span className="mx-4 prose max-w-full text-xs whitespace-nowrap">
        {messageText}
      </span>
      <div className="grow border-t border-gray-300"></div>
    </div>
  );
}

function attachmentsToDataUrls(attachments?: Attachment[]) {
  return (attachments ?? []).map((a) => `data:${a.type};base64,${a.content}`);
}

export function ChatMessage({
  message,
  linkTargetInNewTab = true,
  conversationId,
  mavenUserId,
  onBailoutFormSubmitSuccess,
}: MessageProps) {
  const t = useTranslations("chat.Handoff");
  if ("type" in message) {
    switch (message.type) {
      case "USER":
        return (
          <ChatBubble
            direction="right"
            className="bg-[--brand-color] text-[--brand-font-color]"
          >
            <UserMessage
              text={"text" in message ? message.text : ""}
              attachmentUrls={attachmentsToDataUrls(
                (message as UserChatMessage).attachments,
              )}
              linkTargetInNewTab={linkTargetInNewTab}
            />
          </ChatBubble>
        );
      case "ERROR":
        return (
          <ChatBubble
            direction="left"
            className="border-red-500 bg-red-50 text-xs"
          >
            <ErrorMessage
              text={"text" in message ? message.text : ""}
              linkTargetInNewTab={linkTargetInNewTab}
            />
          </ChatBubble>
        );
      case "SIMULATED":
        return (
          <ChatBubble direction="left">
            <SimulatedMessage
              text={"text" in message ? message.text : ""}
              linkTargetInNewTab={linkTargetInNewTab}
            />
          </ChatBubble>
        );
      case "ChatMessage":
        return renderSalesforceMessage(message as SalesforceChatMessage);
      case "handoff-zendesk":
        return renderHandoffMessage(message as ZendeskWebhookMessage);
      case "front-agent":
      case "front-autoreply":
        return renderFrontAgentMessage(message as Front.WebhookMessage);
      case SALESFORCE_MESSAGE_TYPES.ChatEstablished:
      case SALESFORCE_MESSAGE_TYPES.ChatEnded:
      case SALESFORCE_MESSAGE_TYPES.ChatConnecting:
      case SALESFORCE_MESSAGE_TYPES.ChatTransferred:
      case SALESFORCE_MESSAGE_TYPES.QueueUpdate:
      case SALESFORCE_MESSAGE_TYPES.ChatRequestFail:
        return renderHandoffEventMessage(
          message as IncomingHandoffConnectionEvent,
          t,
        );
      case undefined:
      default:
        if (isBotMessage(message as Message)) {
          return renderBotMessage(
            message as ConversationMessageResponse.Bot,
            conversationId,
            linkTargetInNewTab,
            mavenUserId,
            onBailoutFormSubmitSuccess,
          );
        }
        return null;
    }
  }
  return null;
}

function UserMessage({
  text,
  attachmentUrls,
  linkTargetInNewTab = true,
}: {
  text: string;
  attachmentUrls?: string[];
  linkTargetInNewTab?: boolean;
}) {
  const hasAttachments = useMemo(
    () => !!attachmentUrls?.length,
    [attachmentUrls],
  );

  return (
    <div className="text-xs">
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {text}
      </ReactMarkdown>
      {hasAttachments && (
        <img
          alt="Attachment"
          className="max-w-80 max-h-80"
          src={attachmentUrls?.[0]}
        />
      )}
    </div>
  );
}

function BotMessage({
  message,
  linkTargetInNewTab = true,
}: {
  message: ConversationMessageResponse.Bot;
  linkTargetInNewTab?: boolean;
}) {
  const messageText = message.responses
    .filter((r) => r.type === "text")
    .map(({ text }) => text)
    .join("")
    .replaceAll("\\n", "\n");
  return (
    <div dir="auto" className="prose max-w-full overflow-auto text-xs">
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {messageText}
      </ReactMarkdown>
      <MessageCharts message={message} />
    </div>
  );
}

function ErrorMessage({
  text,
  linkTargetInNewTab = true,
}: {
  text: string;
  linkTargetInNewTab?: boolean;
}) {
  return (
    <div dir="auto" className="flex items-center">
      <HiOutlineExclamationCircle className="size-5 text-red-500" />
      <div className="ml-3 flex-1 content-center">
        <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
          {text !== "" ? text : "An error occurred. Please try again."}
        </ReactMarkdown>
      </div>
    </div>
  );
}

function SimulatedMessage({
  text,
  linkTargetInNewTab = true,
}: {
  text: string;
  linkTargetInNewTab?: boolean;
}) {
  return (
    <div dir="auto" className="prose max-w-full text-xs">
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {text}
      </ReactMarkdown>
    </div>
  );
}

function renderBotMessage(
  message: ConversationMessageResponse.Bot | ActionChatMessage,
  conversationId: string | undefined,
  linkTargetInNewTab: boolean,
  mavenUserId: string | null,
  onBailoutFormSubmitSuccess: UseChatResponse["onBailoutFormSubmitSuccess"],
) {
  if (!showBotAnswer({ message })) {
    return null;
  }
  const showActionForm = isActionChatMessage(message);
  const showEscalationForm = isEscalationChatMessage(message);
  return (
    <ChatBubble direction="left">
      <BotMessage message={message} linkTargetInNewTab={linkTargetInNewTab} />
      {showActionForm && (
        <BailoutFormDisplay
          action={message.action}
          conversationId={conversationId ?? ""}
          onSubmitSuccess={onBailoutFormSubmitSuccess}
        />
      )}
      {showEscalationForm && <EscalationFormDisplay />}
      {!showActionForm && !showEscalationForm && conversationId && (
        <FeedbackForm
          message={message}
          conversationId={conversationId}
          mavenUserId={mavenUserId}
        />
      )}
    </ChatBubble>
  );
}
