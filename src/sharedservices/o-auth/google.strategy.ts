import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { CallCenterAuthService } from '../CallCenterAuthService';
import { AgentType } from 'src/models/AppAgentSchema';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private authService: CallCenterAuthService
  ) {
    super({
      clientID: configService.get<string>('client_id'),
      clientSecret: configService.get<string>('client_secret'),
      callbackURL: configService.get<string>('GOOGLE_CALLBACK_URL'), 
      scope: ['email', 'profile'],
      prompt: 'select_account'
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const {name, emails, photos } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
    };
    console.log('Google user profile:', user);

    // Check if user exists in your database
    let appUser;
    try {
      appUser = await this.authService.finduserbyemail(user.email);
    } catch (e) {
      // User doesn't exist, create a new one
      const randomPassword = Math.random().toString(36).slice(-8);
      appUser = await this.authService.register(
        user.email,
        randomPassword,
        user.firstName,
        user.lastName,
        AgentType.AGENT
      );
    }

    done(null, appUser);
  }
}