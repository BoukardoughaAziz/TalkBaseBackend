import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import * as Redis from 'ioredis';

@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const useRedis = process.env.USE_REDIS === 'true';

        if (useRedis) {
          return new Redis.Redis({
            host: 'localhost', // Redis server address
            port: 6379, // Default Redis port
            password: 'your-password', // Optional password
            db: 0, // Default Redis DB
          });
        }
      },
    },
    RedisService,
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
