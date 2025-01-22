import { Injectable } from '@nestjs/common';

import { Redis } from 'ioredis';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class StorageService {
  private redisClient: Redis;
  private localMap: Map<string, string>;

  constructor(private readonly redisService: RedisService) {
    // Initialize Redis client and local Map
    this.redisClient = this.redisService.getClient();
    this.localMap = new Map<string, string>();

    // Load config to decide whether to use Redis or local Map
    const useRedis = process.env.USE_REDIS === 'true';

    if (useRedis) {
      console.log('Using Redis for data storage');
    } else {
      console.log('Using Local Map for data storage');
    }
  }

  // Method to decide whether to use Redis or Local Map
  private getStorage(): 'redis' | 'map' {
    return process.env.USE_REDIS === 'true' ? 'redis' : 'map';
  }

  // Set method for both Redis and Map
  async set(key: string, value: string): Promise<void> {
    const storage = this.getStorage();

    if (storage === 'redis') {
      await this.redisClient.set(key, value);
    } else {
      this.localMap.set(key, value);
    }
  }
  totalLength(): number {
    return this.localMap.values.length;
  }

  // Get method for both Redis and Map
  async get(key: string): Promise<string | null> {
    const storage = this.getStorage();

    if (storage === 'redis') {
      return await this.redisClient.get(key);
    } else {
      return this.localMap.get(key) || null;
    }
  }

  // Delete method for both Redis and Map
  async delete(key: string): Promise<void> {
    const storage = this.getStorage();

    if (storage === 'redis') {
      await this.redisClient.del(key);
    } else {
      this.localMap.delete(key);
    }
  }

  // Check if a key exists in either Redis or Map
  async exists(key: string): Promise<boolean> {
    const storage = this.getStorage();

    if (storage === 'redis') {
      const result = await this.redisClient.exists(key);
      return result === 1;
    } else {
      return this.localMap.has(key);
    }
  }
}
