import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatModule } from './ChatModule/ChatModule';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/Nwidget'), // Make sure this is your correct MongoDB connection string
    ChatModule, // Ensure ChatModule is imported here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
