import { Body, Controller, Logger, Post } from '@nestjs/common';

import { VideoService } from '../sharedservices/VideoService';

@Controller('api/livekit')
export class LiveKitController {
  private readonly logger = new Logger(LiveKitController.name);
  constructor(private videoService: VideoService) {}
  @Post('/generateLiveKitToken')
  async generateLiveKitToken(@Body() generateLiveKitToken: any) {
    
    return await this.videoService.generateLiveKitToken(
      generateLiveKitToken.roomName,
      generateLiveKitToken.userIdentity,
    );
  }
}
