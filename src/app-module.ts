import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './AuthenticationModule/auth.module';
import { ChatModule } from './ChatModule/ChatModule';
import { ConfigModule } from '@nestjs/config';
 

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/Nwidget'), AuthModule,ChatModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
