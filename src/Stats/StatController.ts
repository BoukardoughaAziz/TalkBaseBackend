import { Body, Controller, Logger, Post,Get, Query } from '@nestjs/common';
import { StatService } from '../sharedservices/StatService';

@Controller('api/stats')
export class StatController {
  private readonly logger = new Logger(StatController.name);
  constructor(private readonly statService: StatService) {}

  @Post('/spendTimeOnPage')
  async spendTimeOnPage(@Body() statMessage: any) {
    console.log('Received tracking data:', statMessage); 
    return await this.statService.spendTimeOnPage(statMessage);
  }
  @Get('/getStatistics')
  async getStatistics(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string
  ) {
    this.logger.log(`Fetching statistics from ${startDate} to ${endDate}`);
    return await this.statService.getStatistics(startDate, endDate);
  }
  
}
