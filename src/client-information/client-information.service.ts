import { Injectable } from '@nestjs/common';
import { CreateClientInformationDto } from './dto/create-client-information.dto';
import { UpdateClientInformationDto } from './dto/update-client-information.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ClientInformation, ClientInformationDocument } from './entities/client-information.entity';

@Injectable()
export class ClientInformationService {
  constructor(
    @InjectModel(ClientInformation.name) private clientInformationModel: Model<ClientInformationDocument>,
  ) {}

  async create(createClientInformationDto: CreateClientInformationDto): Promise<ClientInformation> {
    console.log(createClientInformationDto);
    const createdClientInformation = new this.clientInformationModel(createClientInformationDto);
    return createdClientInformation.save();
  }

  
  async findByIdentifier(identifier: string): Promise<ClientInformation> {
    return this.clientInformationModel.findOne({ identifier }).exec();
  }
  async findAll(): Promise<ClientInformation[]> {
    return this.clientInformationModel.find().exec();
  }

  async findOne(id: string): Promise<ClientInformation> {
    return this.clientInformationModel.findById(id).exec();
  }

  async update(identifier: string, updateClientInformationDto: UpdateClientInformationDto): Promise<ClientInformation> {
    return this.clientInformationModel.findOneAndUpdate({ identifier }, updateClientInformationDto, { new: true }).exec();
  }

  async remove(id: string): Promise<ClientInformation> {
    return this.clientInformationModel.findByIdAndDelete(id).exec();
  }
}
