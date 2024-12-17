import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from 'src/services/AuthService';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AppAgent, AppAgentSchema } from 'src/models/AppAgentSchema';
import { JwtStrategy } from './JwtStrategy';
import { ConfigService } from '@nestjs/config';
 
  

@Module({
  imports: [
    MongooseModule.forFeature([
        { name: AppAgent.name, schema: AppAgentSchema }, 
        ]), JwtModule.register({
          secret: process.env.JWT_SECRET  ,
          signOptions: { expiresIn: '1h' },
        }),
  ],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy,ConfigService],
})
export class AuthModule {}
