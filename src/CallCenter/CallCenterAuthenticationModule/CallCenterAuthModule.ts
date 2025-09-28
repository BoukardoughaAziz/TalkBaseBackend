import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppAgent, AppAgentSchema } from 'src/models/AppAgentSchema';
import { ConfigService } from '@nestjs/config';
import { CallCenterAuthService } from 'src/sharedservices/CallCenterAuthService';
import { CallCenterAuthController } from './CallCenterAuthController';
import { MailerService } from 'src/sharedservices/MailServices';
import { GoogleStrategy } from 'src/sharedservices/o-auth/google.strategy';

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
