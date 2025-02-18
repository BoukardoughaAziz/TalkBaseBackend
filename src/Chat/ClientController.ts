import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { AppClientService } from '../sharedservices/AppClientService';

@Controller('clients')
export class ClientController {
  constructor(private readonly appClientService: AppClientService) {}

  @Get('stats')
  async getStats() {
    const totalClients = await this.appClientService.getTotalClients();
    const clientMessages = await this.appClientService.getClientMessages();
    const clientsByOS = await this.appClientService.getClientsByOS();
    const clientsByBrowser = await this.appClientService.getClientsByBrowser();
    const clientsByCountry = await this.appClientService.getClientsByCountry();
    const mostActiveClients =
      await this.appClientService.getMostActiveClients();

    return {
      totalClients,
      clientMessages,
      clientsByOS,
      clientsByBrowser,
      clientsByCountry,
      mostActiveClients,
    };
  }

  @Get('live')
  async getLiveClients() {
    return { liveClients: await this.appClientService.getLiveClients() };
  }

  @Get('today')
  async getClientsToday() {
    return { clientsToday: await this.appClientService.getClientsToday() };
  }

  @Get('weekly')
  async getClientsLast7Days() {
    return {
      clientsLast7Days: await this.appClientService.getClientsLast7Days(),
    };
  }

  @Get('range')
  async getClientsInRange(
    @Query('start') start: string,
    @Query('end') end: string,
  ) {
    return {
      clientsInRange: await this.appClientService.getClientsInRange(start, end),
    };
  }
}
