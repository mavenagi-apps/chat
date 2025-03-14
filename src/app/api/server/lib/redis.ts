import { createClient } from "redis";
import { Cacheable } from "cacheable";
import KeyvRedis from "@keyv/redis";

// Create a Redis client factory
const createRedisClient = async (mode?: "Publish" | "Subscribe") => {
  const client = createClient({
    url: process.env.STORAGE_REDIS_URL,
  });

  client.on("error", (err) =>
    console.error("Redis Client Error", { mode }, err),
  );

  await client.connect();

  return client;
};

const globalForRedis = global as unknown as {
  redisPublish: ReturnType<typeof createClient> | undefined;
  redisSubscribe: ReturnType<typeof createClient> | undefined;
  redisCache: Cacheable | undefined;
};

export const getRedisPublishClient = async () => {
  if (!globalForRedis.redisPublish) {
    globalForRedis.redisPublish = await createRedisClient("Publish");
  }
  return globalForRedis.redisPublish;
};

export const getRedisSubscribeClient = async () => {
  if (!globalForRedis.redisSubscribe) {
    globalForRedis.redisSubscribe = await createRedisClient("Subscribe");
  }
  return globalForRedis.redisSubscribe;
};

export const getRedisCache = async () => {
  if (!globalForRedis.redisCache) {
    globalForRedis.redisCache = new Cacheable({
      primary: new KeyvRedis(process.env.STORAGE_REDIS_URL),
    });
  }
  return globalForRedis.redisCache;
};
