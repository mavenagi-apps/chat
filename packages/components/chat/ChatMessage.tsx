import React from "react";
import HighchartsReact from "highcharts-react-official";
import Highcharts from "highcharts";
import { ReactMarkdown } from "@magi/components/ReactMarkdown";
import { ChatBubble } from "@magi/components/chat/ChatCard";
import { HiOutlineExclamationCircle } from "react-icons/hi2";
import FeedbackForm from "@magi/components/chat/FeedbackForm";
import BailoutFormDisplay from "@magi/components/chat/BailoutFormDisplay";
import EscalationFormDisplay from "@magi/components/chat/EscalationFormDisplay";
import { showBotAnswer } from "@/lib/chat/chat-helpers";
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
} from "@/types";
import { Attachment, type ConversationMessageResponse } from "mavenagi/api";
import { useTranslations } from "next-intl";
import type { Front } from "@/types/front";
import { CombinedMessage } from "@/types";

interface MessageProps {
  message: CombinedMessage;
  linkTargetInNewTab?: boolean;
  conversationId?: string;
  initialUserChatMessage?: UserChatMessage | null;
  mavenUserId: string | null;
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
  const author =
    `${message.author.first_name} ${message.author.last_name}`.trim();
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
): string | null {
  const t = useTranslations("chat.Handoff");
  const messageMap = {
    ChatConnecting: () => t("connecting_to_agent"),
    ChatEstablished: () => t("connected_to_agent"),
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

function renderHandoffEventMessage(message: IncomingHandoffConnectionEvent) {
  const messageText = getHandoffEventMessageText(message);
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
}: MessageProps) {
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
        return renderFrontAgentMessage(message as Front.WebhookMessage);
      case "ChatEstablished":
      case "ChatEnded":
      case "ChatConnecting":
      case "ChatTransferred":
      case "QueueUpdate":
        return renderHandoffEventMessage(
          message as IncomingHandoffConnectionEvent,
        );
      default:
        if (isBotMessage(message as Message)) {
          return renderBotMessage(
            message as ConversationMessageResponse.Bot,
            conversationId,
            linkTargetInNewTab,
            mavenUserId,
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
  return (
    <div className="text-xs">
      <ReactMarkdown linkTargetInNewTab={linkTargetInNewTab}>
        {text}
      </ReactMarkdown>
      {attachmentUrls && (
        <img className="max-w-80 max-h-80" src={attachmentUrls[0]} />
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
    <div className="prose max-w-full overflow-auto text-xs">
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
    <div className="flex items-center">
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
    <div className="prose max-w-full text-xs">
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
