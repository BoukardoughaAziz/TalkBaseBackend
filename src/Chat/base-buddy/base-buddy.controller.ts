import { Body, Controller, Post } from '@nestjs/common';
import { BaseBuddyService } from './base-buddy.service';
import { ChatMessage } from 'src/models/ChatMessageSchema';

@Controller('base-buddy')
export class BaseBuddyController {
  constructor(private readonly baseBuddyService: BaseBuddyService) {}

  @Post('ask')
  async askQuestion(@Body() body: { productInfo: string; question: string; ConversationId:string }) {
    console.log("THE QUESTIONS IS  --Controller",body.question);
    console.log("THE LINK IS  --Controller",body.productInfo);
    console.log("THE CONVO ID IS --Controller",body.ConversationId);
    const { productInfo, question , ConversationId} = body;
    const answer:ChatMessage = await this.baseBuddyService.askBaseBuddy(productInfo, question, ConversationId);
    return  answer ;
  }}
