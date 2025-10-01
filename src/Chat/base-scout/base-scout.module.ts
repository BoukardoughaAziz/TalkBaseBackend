import { Module } from '@nestjs/common';
import { BaseScoutService } from './base-scout.service';
import { BaseScoutController } from './base-scout.controller';

@Module({
  controllers: [BaseScoutController],
  providers: [BaseScoutService],
})
export class BaseScoutModule {}
