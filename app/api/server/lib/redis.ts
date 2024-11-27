import { createClient } from 'redis';

console.log('REDIS_URL', process.env.REDIS_URL?.substring(0, 5));

// Create a Redis client
const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('error', (err) => console.error('Redis Client Error', err));

// Connect to Redis
redisClient.connect().catch(console.error);

export default redisClient;
