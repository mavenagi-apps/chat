import type { Front } from "@/types/front";
import { nanoid } from "nanoid";
import type { HandoffChatMessage, VerifiedUserData } from "@/types";
import {
  FrontApplicationClient,
  FrontCoreClient,
} from "@/app/api/front/client";
import Keyv from "keyv";
import { Cacheable, KeyvCacheableMemory } from "cacheable";
import { getRedisCache } from "@/app/api/server/lib/redis";
import { DateTime } from "luxon";

import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import { unified } from "unified";

const mdParser = unified()
  .use(remarkParse)
  .use(remarkGfm)
  .use(remarkRehype)
  .use(rehypeStringify);

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

export async function sendMessageToFront(
  client: FrontApplicationClient,
  message: Front.AppChannelInboundMessage | Front.AppChannelOutboundMessage,
) {
  if ((message as Front.AppChannelOutboundMessage).to) {
    // markdown to html
    message.body = String(await mdParser.process(message.body));
    return client.sendOutgoingMessages(
      message as Front.AppChannelOutboundMessage,
    );
  }
  return client.sendIncomingMessages(message as Front.AppChannelInboundMessage);
}

async function searchPages<T extends Front.PagedResource>(
  loader: (params?: Front.PagedEndpointParams) => Promise<Front.List<T>>,
  predicate: (resource: T) => boolean,
) {
  let next: string | null = null;
  let item: T | null | undefined = null;

  while (!item) {
    const items = await loader({ next });
    item = items._results.find(predicate);
    next = items._pagination.next;
    if (!next) {
      break;
    }
  }

  return item;
}

async function* loadAllItems<T extends Front.PagedResource>(
  loader: (params?: Front.PagedEndpointParams) => Promise<Front.List<T>>,
) {
  let next: string | null = "";

  while (next !== null) {
    const items = await loader({ next });
    next = items._pagination.next;
    for (const item of items._results) {
      yield item;
    }
  }
}

async function findChannel(
  client: FrontCoreClient,
  channelName: string,
): Promise<Front.Channel | undefined> {
  return searchPages(
    client.channels,
    (channel) => channel.name === channelName,
  );
}

export async function findInbox(
  client: FrontCoreClient,
  inboxName: string,
): Promise<Front.Inbox | undefined> {
  return searchPages(client.inboxes, (inbox) => inbox.name === inboxName);
}

export async function* findShifts(
  client: FrontCoreClient,
  shiftNames: string[],
) {
  const shiftNamesSet = new Set(shiftNames);
  for await (const shift of loadAllItems(client.shifts)) {
    if (shiftNamesSet.has(shift.name)) {
      shiftNamesSet.delete(shift.name);
      yield shift;
    }
    if (!shiftNamesSet.size) {
      // All shifts found, no need to continue
      return;
    }
  }
}

export async function isAnyoneAvailable(
  client: FrontCoreClient,
  shiftNames: string[],
): Promise<boolean> {
  // If no shifts are provided, we assume that someone is always available
  if (!shiftNames.length) {
    return true;
  }
  const now = new Date();
  for await (const shift of findShifts(client, shiftNames)) {
    if (!isShiftActive([shift], now)) {
      continue;
    }
    // shift is active, check if anyone is available
    for await (const tm of loadAllItems(
      client.shiftsTeammates.bind(client, shift.id),
    )) {
      if (tm.is_available && !tm.is_blocked) {
        return true;
      }
    }
  }
  return false;
}

export function isShiftActive(shifts: Front.Shift[], moment: Date) {
  const now = moment.getTime();
  const utcShifts = shifts.flatMap((shiftInfo) => {
    const { timezone, times } = shiftInfo;
    const timeAtZone = DateTime.fromObject({}, { zone: timezone });
    const dayAtZone = (timeAtZone.weekdayShort?.toLowerCase() ??
      "") as Front.ShiftDays;
    const shiftForDay = times[dayAtZone];

    return [shiftForDay]
      .filter((shift) => !!shift)
      .map((shiftHours) => {
        const { start, end } = shiftHours;
        const [startHour, startMinute] = start.split(":").map(Number);
        const [endHour, endMinute] = end.split(":").map(Number);
        return {
          start: DateTime.fromObject(
            { hour: startHour, minute: startMinute },
            { zone: timezone },
          )
            .toUTC()
            .toMillis(),
          end: DateTime.fromObject(
            { hour: endHour, minute: endMinute },
            { zone: timezone },
          )
            .toUTC()
            .toMillis(),
        };
      });
  });

  return utcShifts.some((s) => s.start <= now && now <= s.end);
}

export async function createApplicationChannelClient(
  organizationId: string,
  agentId: string,
  config: FrontHandoffConfiguration,
) {
  const channelName = config.channelName;
  // include agent in cache key to avoid conflicts between different front installations
  // if the same channel name is used across customers
  const cacheKey = `front-channel-${organizationId}-${agentId}-${channelName}`;
  const channelCache = await getChannelCache();
  let channelId = await channelCache.get<string>(cacheKey);

  if (!channelId) {
    const coreClient = createCoreClient(config);
    const channel = await findChannel(coreClient, channelName);
    if (!channel) {
      throw new Error(`Channel ${channelName} not found`);
    }
    channelId = channel.id;
    await channelCache.set(cacheKey, channelId, "1h");
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

export async function postMavenMessagesToFront({
  conversationId,
  client,
  messages,
  userInfo,
}: {
  conversationId: string;
  client: FrontApplicationClient;
  messages: HandoffChatMessage[];
  userInfo: VerifiedUserData;
}) {
  const frontMessages = messages
    .map((message: any) =>
      convertToFrontMessage(conversationId, userInfo, message),
    )
    .filter((message) => !!message);

  if (!frontMessages.length) {
    return;
  }

  for (const message of frontMessages) {
    try {
      await sendMessageToFront(client, message);
    } catch (error) {
      console.error("Failed to deliver message to Front", error);
      throw new Error("Failed to deliver message");
    }
  }
}
