import type { Front } from "@/types/front";
import { nanoid } from "nanoid";
import type { HandoffChatMessage, VerifiedUserData } from "@/types";
import { FrontApplicationClient, FrontCoreClient } from "./client";
import Keyv from "keyv";
import { Cacheable, KeyvCacheableMemory } from "cacheable";
import { getRedisCache } from "@/app/api/server/lib/redis";

let channelCache: Cacheable | undefined;
async function getChannelCache() {
  if (!channelCache) {
    let redisCache: Cacheable | undefined;
    try {
      redisCache = await getRedisCache();
    } catch (error) {
      console.error("Error getting redis cache", error);
    }
    channelCache = new Cacheable({
      nonBlocking: true,
      primary: new Keyv({
        store: new KeyvCacheableMemory({
          lruSize: 100,
          ttl: "1h",
        }),
      }),
      secondary: redisCache?.primary,
    });
  }
  return channelCache;
}

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
  const channelName = config.channelName;
  const channelCache = await getChannelCache();
  let channelId = await channelCache.get<string>(channelName);

  if (!channelId) {
    const coreClient = createCoreClient(config);
    const channel = await findChannel(coreClient, channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }
    channelId = channel.id;
    await channelCache.set(channelName, channelId, "1h");
  }
  return new FrontApplicationClient(
    config.appId,
    config.apiSecret,
    channelId,
    config.host,
  );
}
export function createCoreClient(config: FrontHandoffConfiguration) {
  return new FrontCoreClient(config.apiKey, config.host);
}
