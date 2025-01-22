import { Injectable, Inject } from '@nestjs/common';
import * as Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis.Redis,
  ) {}
  getClient(): Redis.Redis {
    return this.redisClient;
  }
  // Example method to set a value in Redis
  async setValue(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  // Example method to get a value from Redis
  async getValue(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }
}
