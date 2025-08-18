const Redis = require('ioredis');
require('dotenv').config();

const redisConfig = {
  host: process.env.REDIS_HOST,
  port: process.env.REDIS_PORT,
  username: process.env.REDIS_USERNAME,
  password: process.env.REDIS_PASSWORD,
  tls: {
    rejectUnauthorized: false, 
  },
  retryStrategy: (times) => Math.min(times * 50, 2000), 
  maxRetriesPerRequest: 3,
  keyPrefix: process.env.REDIS_PREFIX || 'myapp:'
};

const redis = new Redis(redisConfig);

// Logging
redis.on('connect', () => {
  console.log('Connected to Redis');
});

redis.on('ready', () => {
  console.log(' Redis is ready to use');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err.message);
});

redis.on('close', () => {
  console.warn(' Redis connection closed');
});

module.exports = redis;
