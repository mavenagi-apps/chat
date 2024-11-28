import { createClient } from 'redis';

// Create a Redis client
const redisClient = createClient({
  url: process.env.STORAGE_REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));
redisClient.on('ready', () => console.log('Redis Client Ready'));

// Connect to Redis
redisClient.connect().catch(console.error);

export default redisClient;
