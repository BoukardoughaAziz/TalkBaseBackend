import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ClientInformationService } from './client-information.service';
import { ClientInformationController } from './client-information.controller';
import { ClientInformationSchema } from './schemas/client-information.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'ClientInformation', schema: ClientInformationSchema }]),
  ],
  controllers: [ClientInformationController],
  providers: [ClientInformationService],
  exports: [ClientInformationService],
})
export class ClientInformationModule {}
