import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../models/ChatMessageSchema';
import { AppClient, AppClientDocument } from '../models/AppClientSchema';

@Injectable()
export class AppClientService {
  constructor(
    @InjectModel(AppClient.name)
    private appClientModel: Model<AppClientDocument>,
    @InjectModel(ChatMessage.name) 
    private chatMessageModel: Model<ChatMessageDocument>
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

   //  Total Clients
   async getTotalClients(): Promise<number> {
    return this.appClientModel.countDocuments();
  }

  //  Messages Sent by Clients
  async getClientMessages(): Promise<number> {
    return this.chatMessageModel.countDocuments({ chatDirection: "FromClientToAgent" });
  }

  //  Clients by OS
  async getClientsByOS(): Promise<{ os: string; count: number }[]> {
    const result = await this.appClientModel.aggregate([
      { $group: { _id: "$appOS", count: { $sum: 1 } } }
    ]);
    return result.map(({ _id, count }) => ({ os: _id, count }));
  }

  //  Clients by Browser
  async getClientsByBrowser(): Promise<{ browser: string; count: number }[]> {
    const result = await this.appClientModel.aggregate([
      { $group: { _id: "$appBrowser", count: { $sum: 1 } } }
    ]);
    return result.map(({ _id, count }) => ({ browser: _id, count }));
  }

  //  Clients by Country 
  async getClientsByCountry(): Promise<{ countryCode: string; count: number }[]> {
    return this.appClientModel.aggregate([
      { $group: { _id: "$countryCode", count: { $sum: 1 } } },
      { $sort: { count: -1 } } // Sort by highest number of clients
    ]).then(results => results.map(({ _id, count }) => ({ countryCode: _id, count })));
  }

  //  Most Active Clients 
  async getMostActiveClients(): Promise<{ identifier: string; messagesSent: number }[]> {
    return this.chatMessageModel.aggregate([
      { $group: { _id: "$identifier", messagesSent: { $sum: 1 } } },
      { $sort: { messagesSent: -1 } },
      { $limit: 5 }
    ]);}

     //  Live Clients (Active in the last 5 minutes)
  async getLiveClients(): Promise<number> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.appClientModel.countDocuments({ updatedAt: { $gte: fiveMinutesAgo } });
  }

  //  Clients Per Day (Last 24 Hours)
  async getClientsToday(): Promise<number> {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    return this.appClientModel.countDocuments({ createdAt: { $gte: startOfDay } });
  }

  //  Clients Per Week
  async getClientsLast7Days(): Promise<{ date: string; count: number }[]> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return this.appClientModel.aggregate([
      { 
        $match: { createdAt: { $gte: sevenDaysAgo } }
      },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, 
          count: { $sum: 1 } 
        } 
      },
      { $sort: { _id: 1 } }  
    ]);
  }
  //  Clients in Custom Date Range
  async getClientsInRange(startDate: string, endDate: string): Promise<number> {
    return this.appClientModel.countDocuments({
      createdAt: { $gte: new Date(startDate), $lte: new Date(endDate) }
    });
  }  
}
