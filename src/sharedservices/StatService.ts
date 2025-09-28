import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AppStat, AppStatDocument } from '../models/AppStatSchema';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(AppStat.name) private readonly appStatModel: Model<AppStatDocument>,
  ) {}

  async spendTimeOnPage(statMessage: any) {
    return await this.appStatModel.create({
      appClient: statMessage.appClient,
      duration: statMessage.duration,
      page: statMessage.page,
    });
  }

  async getStatistics(startDate: string, endDate: string) {
    const filter: any = {};
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }
    return await this.appStatModel.find(filter).exec();
  }
}
