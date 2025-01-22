import { Module } from '@nestjs/common';

 
import { StatService } from 'src/sharedservices/StatService';
import { StatController } from './StatController';
 

@Module({
  imports: [ 
  ], // Ensure this line is correct
  providers: [StatService],
  controllers: [StatController],
  exports: [], // Exporting the service if you want to use it in other modules
})
export class StatModule {}
