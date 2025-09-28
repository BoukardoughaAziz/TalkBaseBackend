import { Module } from '@nestjs/common';

 
import { VideoService } from '../sharedservices/VideoService';
import { LiveKitController } from './LiveKitController';
 

@Module({
  imports: [ 
  ],  
  providers: [VideoService],
  controllers: [LiveKitController],
  exports: [], // Exporting the service if you want to use it in other modules
})
export class LiveKitModule {}
