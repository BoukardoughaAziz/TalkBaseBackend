import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallCenterAuthModule } from './CallCenter/CallCenterAuthenticationModule/CallCenterAuthModule';
import { ChatModule } from './Chat/ChatModule';
import { LiveKitModule } from './LiveKit/LiveKitModule';
 

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/Nwidget'),//Nwidget?replicaSet=rs0
    CallCenterAuthModule,
    ChatModule, LiveKitModule
  ], 
  controllers: [], 
  providers: [],
})
export class AppModule {}