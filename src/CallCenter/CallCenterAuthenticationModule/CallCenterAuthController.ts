import { Controller, Post, Body } from '@nestjs/common'; 
import { CallCenterAuthService } from 'src/sharedservices/CallCenterAuthService';

@Controller( 'CallCenterAuthController')
export class CallCenterAuthController {
  constructor(private readonly authService: CallCenterAuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    return this.authService.register(body.email, body.password);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    const user = await this.authService.validateUser(body.email, body.password);
    return this.authService.login(user);
  }
}
