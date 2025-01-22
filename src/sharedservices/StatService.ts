import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AccessToken } from 'livekit-server-sdk';
import { Model } from 'mongoose';
import { AppStat, AppStatDocument } from 'src/models/AppStatSchema';

@Injectable()
export class StatService {
  constructor(
    @InjectModel(AppStat.name)
    private readonly appStatModel: Model<AppStatDocument>,
  ) {}
  async spendTimeOnPage(statMessage: any) {
    const appStat = new AppStat();
    appStat.appClient = statMessage.appClient;
    appStat.duration = statMessage.duration;
    appStat.page = statMessage.page;

    await this.appStatModel.create([appStat]);
  }
}
