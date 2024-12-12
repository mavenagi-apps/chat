import type { Front } from "@/types/front";
import { nanoid } from "nanoid";
import type { HandoffChatMessage, VerifiedUserData } from "@/types";
import { FrontApplicationClient, FrontCoreClient } from "./client";

export function convertToFrontMessage(
  conversationId: string,
  userInfo: VerifiedUserData,
  message: HandoffChatMessage,
): Front.AppChannelInboundMessage | Front.AppChannelOutboundMessage | null {
  const user = {
    handle: userInfo.email,
    name: `${userInfo.firstName} ${userInfo.lastName}`,
  };
  const metadata = {
    external_id:
      message.mavenContext?.conversationMessageId?.referenceId ?? nanoid(),
    external_conversation_id: conversationId,
  };
  const deliveredAt = Math.trunc(
    (message.timestamp ?? new Date().getTime()) / 1000,
  );
  // TODO: get subject from the conversation
  const subject = "Maven Chat";

  if (message.author.type === "user") {
    return {
      body: message.content.text,
      metadata,
      subject,
      delivered_at: deliveredAt,
      attachments: [],
      sender: user,
    } as Front.AppChannelInboundMessage;
  }
  if (message.author.type === "business") {
    return {
      body: message.content.text,
      metadata,
      subject,
      sender_name: "Maven Bot",
      delivered_at: deliveredAt,
      attachments: [],
      to: [user],
    } as Front.AppChannelOutboundMessage;
  }
  return null;
}

export function sendMessageToFront(
  client: FrontApplicationClient,
  message: Front.AppChannelInboundMessage | Front.AppChannelOutboundMessage,
) {
  if ((message as Front.AppChannelOutboundMessage).to) {
    return client.sendOutgoingMessages(
      message as Front.AppChannelOutboundMessage,
    );
  }
  return client.sendIncomingMessages(message as Front.AppChannelInboundMessage);
}

async function findChannel(client: FrontCoreClient, channelName: string) {
  let next: string | null = null;
  let channel: Front.Channel | null | undefined = null;

  while (!channel) {
    const channels = await client.channels({ next });
    channel = channels._results.find((channel) => channel.name === channelName);

    if (channel || !channels._pagination.next) {
      break;
    }
    next = channels._pagination.next;
  }

  return channel;
}

export async function createApplicationChannelClient(
  config: FrontHandoffConfiguration,
) {
  const coreClient = createCoreClient(config);
  const channelName = config.channelName;
  // TODO: store channelId in redis cache w/ a TTL
  const channel = await findChannel(coreClient, channelName);
  if (!channel) {
    throw new Error(`Channel ${channelName} not found`);
  }
  return new FrontApplicationClient(
    config.appId,
    config.apiSecret,
    channel.id,
    config.host,
  );
}
export function createCoreClient(config: FrontHandoffConfiguration) {
  return new FrontCoreClient(config.apiKey, config.host);
}
