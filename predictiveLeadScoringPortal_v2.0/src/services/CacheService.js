const { createClient } = require('redis');
const autoBind = require('../utils/autoBind');

class CacheService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    autoBind(this);
  }

  async connect() {
    if (this.isConnected && this.client) {
      return this.client;
    }

    try {
      const config = require('../config/environment');
      const redisUrl = config.redis.url || process.env.REDIS_URL || 'redis://localhost:6379';
      this.client = createClient({ url: redisUrl });

      this.client.on('error', (err) => {
        console.error('Redis Client Error:', err);
        this.isConnected = false;
      });

      this.client.on('connect', () => {
        console.log('Redis Client Connected');
        this.isConnected = true;
      });

      await this.client.connect();
      return this.client;
    } catch (error) {
      console.error('Failed to connect to Redis:', error);
      // Return null if Redis is not available - app should still work without cache
      return null;
    }
  }

  async get(key) {
    try {
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return null;
      }

      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Redis GET error:', error);
      return null;
    }
  }

  async set(key, value, ttlSeconds = 600) {
    try {
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return false;
      }

      await this.client.setEx(key, ttlSeconds, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Redis SET error:', error);
      return false;
    }
  }

  async delete(key) {
    try {
      if (!this.client || !this.isConnected) {
        await this.connect();
      }

      if (!this.client) {
        return false;
      }

      await this.client.del(key);
      return true;
    } catch (error) {
      console.error('Redis DELETE error:', error);
      return false;
    }
  }

  generateCacheKey(prefix, identifier) {
    return `score:${prefix}:${identifier}`;
  }

  generateLeadCacheKey(leadId) {
    return this.generateCacheKey('lead', leadId);
  }

  generateFeatureCacheKey(features) {
    // Create hash from features for cache key
    const featureString = JSON.stringify(features);
    const crypto = require('crypto');
    const hash = crypto.createHash('md5').update(featureString).digest('hex');
    return this.generateCacheKey('features', hash);
  }
}

module.exports = new CacheService();