import { createClient } from "redis";

// Create a Redis client factory
const createRedisClient = () => {
  const client = createClient({
    url: process.env.STORAGE_REDIS_URL,
  });

  client.on("error", (err) => console.error("Redis Client Error", err));
  client.on("ready", () => console.log("Redis Client Ready"));

  return client;
};

// Create instance
const redisClient = createRedisClient();

export default redisClient;
