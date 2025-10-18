import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallCenterAuthModule } from './CallCenter/CallCenterAuthenticationModule/CallCenterAuthModule';
import { ChatModule } from './Chat/ChatModule';
import { LiveKitModule } from './LiveKit/LiveKitModule';
 import{StatModule} from'./Stats/StatModule';
 import { ClientInformationModule } from './client-information/client-information.module';
import { ConversationModule } from './conversation/conversation.module';
import { BaseBuddyModule } from './Chat/base-buddy/base-buddy.module';
import {  BaseScoutModule } from './Chat/base-scout/base-scout.module';
 

@Module({
  imports: [
    MongooseModule.forRoot('mongodb+srv://azizboukardougha:N4TMDDmbsefVd8fd@cluster0.ojgrhfb.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'),//Nwidget?replicaSet=rs0
    CallCenterAuthModule,
    ChatModule, LiveKitModule,StatModule, ClientInformationModule,ConversationModule,BaseBuddyModule,
    BaseScoutModule
  ], 
  controllers: [], 
  providers: [],
})
export class AppModule {}
