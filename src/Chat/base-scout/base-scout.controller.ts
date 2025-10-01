import { BaseScoutService } from './base-scout.service';
import { Body, Controller, Post } from '@nestjs/common';
import { ChatMessage } from '../../models/ChatMessageSchema';

@Controller('base-scout')
export class BaseScoutController {
  constructor(private readonly baseScoutService: BaseScoutService) {}


    @Post('scout')
  async askQuestion(@Body() body: { productLink: string; }) {
    console.log("THE LINK IS  --Controller",body.productLink);
    const { productLink } = body;
    const answer:ChatMessage = await this.baseScoutService.askBaseScout(productLink);
    return  answer ;
  }}

