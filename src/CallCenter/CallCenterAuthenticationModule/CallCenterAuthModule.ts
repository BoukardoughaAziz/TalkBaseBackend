import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppAgent, AppAgentSchema } from '../../models/AppAgentSchema';
import { ConfigService } from '@nestjs/config';
import { CallCenterAuthService } from '../../sharedservices/CallCenterAuthService';
import { CallCenterAuthController } from './CallCenterAuthController';
import { MailerService } from '../../sharedservices/MailServices';
import { GoogleStrategy } from '../../sharedservices/o-auth/google.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: AppAgent.name, schema: AppAgentSchema }, 
        ]), JwtModule.register({
          secret: process.env.JWT_SECRET  ,
          signOptions: { expiresIn: '1h' },
        }),
  ],
  controllers: [CallCenterAuthController],
  providers: [CallCenterAuthService, ConfigService, MailerService,GoogleStrategy],
})
export class CallCenterAuthModule {}
