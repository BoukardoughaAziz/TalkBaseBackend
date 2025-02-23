import {
  Controller,
  Post,
  Body,
  Get,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { CallCenterAuthService } from 'src/sharedservices/CallCenterAuthService';
import { AgentType } from 'src/models/AppAgentSchema'; // Import AgentType

@Controller('CallCenterAuthController')
export class CallCenterAuthController {
  constructor(private readonly authService: CallCenterAuthService) {}

  @Post('register')
  async register(
    @Body()
    body: {
      email: string;
      password: string;
      firstname: string;
      lastname: string;
      type?: AgentType; // Make it optional with correct type
    },
  ) {
    console.log('Received registration request:', {
      ...body,
      password: '***hidden***', // Hide password in logs
    });

    return this.authService.register(
      body.email,
      body.password,
      body.firstname,
      body.lastname,
      body.type || AgentType.AGENT, // Default to AGENT if not provided
    );
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }

  @Post('toggle-agent-approval')
  async toggleAgentApproval(@Body() body: { agentId: string }) {
    return this.authService.toggleAgentApproval(body.agentId);
  }

  @Get('agents')
  async getAllAgents() {
    return this.authService.getAllAgents();
  }
}
