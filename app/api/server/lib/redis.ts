import { createClient } from "redis";

// Create a Redis client factory
const createRedisClient = async (mode?: "Publish" | "Subscribe") => {
  const client = createClient({
    url: process.env.STORAGE_REDIS_URL,
  });

  client.on("error", (err) =>
    console.error("Redis Client Error", { mode }, err),
  );
  client.on("ready", () => console.log("Redis Client Ready", { mode }));

  await client.connect();

  return client;
};

const globalForRedis = global as unknown as {
  redisPublish: ReturnType<typeof createClient> | undefined;
  redisSubscribe: ReturnType<typeof createClient> | undefined;
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
