import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CallCenterAuthModule } from './CallCenter/CallCenterAuthenticationModule/CallCenterAuthModule';
import { ChatModule } from './Chat/ChatModule';
 

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/Nwidget'),//Nwidget?replicaSet=rs0
    CallCenterAuthModule,
    ChatModule, 
  ], 
  controllers: [], 
  providers: [],
})
export class AppModule {}
