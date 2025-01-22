import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { AppClient, AppClientDocument } from '../models/AppClientSchema';

@Injectable()
export class AppClientService {
  constructor(
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
  ) {}
  async findUntreatedClientsAndAgentClients(callCenterAgentEmail) {
    return this.appClientModel
      .find({
        $or: [
          { associatedAgent: { $exists: false } },
          { associatedAgent: null },
          { "associatedAgent.email": callCenterAgentEmail }, //
        ],
      })
      .exec();
  }
  async create(cat: AppClient): Promise<AppClient> {
    const createdCat = new this.appClientModel(cat);
    return createdCat.save();
  }

  async findAll(): Promise<AppClient[]> {
    return this.appClientModel.find().exec();
  }
  async find(query: any): Promise<AppClient[]> {
    return this.appClientModel.find(query).sort({ updatedAt: 1 }).exec();
  }
}
