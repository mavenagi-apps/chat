import { createClient } from "redis";

// Create a Redis client factory
const createRedisClient = async () => {
  const client = createClient({
    url: process.env.STORAGE_REDIS_URL,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));
  client.on("ready", () => console.log("Redis Client Ready"));

  await client.connect();

  return client;
};

const globalForRedis = global as unknown as {
  redis: ReturnType<typeof createClient> | undefined;
};

export const getRedisClient = async () => {
  if (!globalForRedis.redis) {
    globalForRedis.redis = await createRedisClient();
  }
  return globalForRedis.redis;
};
