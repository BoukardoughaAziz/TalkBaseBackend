import { Injectable } from '@nestjs/common';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class VideoService {
  constructor() {}
    sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  public async generateLiveKitToken(roomName, userIdentity) {
    
    const token = new AccessToken(
      process.env.LIVEKIT_APIKEY,
      process.env.LIVEKIT_SECRET, 
      {
        identity: userIdentity,
      },
    );
    token.addGrant({ roomJoin: true, room: roomName });
    return token.toJwt();
  }
}
