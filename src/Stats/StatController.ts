import { Body, Controller, Logger, Post } from '@nestjs/common';
import { StatService } from 'src/sharedservices/StatService';

@Controller('api/stats')
export class StatController {
  private readonly logger = new Logger(StatController.name);
  constructor(private readonly statService: StatService) {}

  @Post('/spendTimeOnPage')
  async spendTimeOnPage(@Body() statMessage: any) {
    const chatMessage = await this.statService.spendTimeOnPage(statMessage);
  }
}
