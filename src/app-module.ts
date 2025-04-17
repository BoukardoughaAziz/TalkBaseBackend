import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallCenterAuthModule } from './CallCenter/CallCenterAuthenticationModule/CallCenterAuthModule';
import { ChatModule } from './Chat/ChatModule';
import { LiveKitModule } from './LiveKit/LiveKitModule';
 import{StatModule} from'./Stats/StatModule';
 import { ClientInformationModule } from './client-information/client-information.module';
import { ConversationModule } from './conversation/conversation.module';
 

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/Nwidget'),//Nwidget?replicaSet=rs0
    CallCenterAuthModule,
    ChatModule, LiveKitModule,StatModule, ClientInformationModule,ConversationModule
  ], 
  controllers: [], 
  providers: [],
})
export class AppModule {}