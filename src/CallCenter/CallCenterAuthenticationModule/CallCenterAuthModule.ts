import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { AppAgent, AppAgentSchema } from 'src/models/AppAgentSchema';
import { ConfigService } from '@nestjs/config';
import { CallCenterAuthService } from 'src/sharedservices/CallCenterAuthService';
import { CallCenterAuthController } from './CallCenterAuthController';

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
  providers: [CallCenterAuthService, ConfigService],
})
export class CallCenterAuthModule {}
