import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StatService } from 'src/sharedservices/StatService';
import { StatController } from './StatController';
import { AppStat, AppStatSchema } from 'src/models/AppStatSchema'; 

@Module({
  imports: [
    MongooseModule.forFeature([{ name: AppStat.name, schema: AppStatSchema }]) 
  ],
  providers: [StatService],
  controllers: [StatController],
  exports: [StatService],
})
export class StatModule {}
