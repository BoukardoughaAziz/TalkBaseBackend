import {
  Controller,
  Post,
  Body,
  Get,
  UnauthorizedException,
  Res,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CallCenterAuthService } from '../../sharedservices/CallCenterAuthService';
import { AgentType } from '../../models/AppAgentSchema';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Controller('CallCenterAuthController')
export class CallCenterAuthController {
  constructor(private readonly authService: CallCenterAuthService) {}

  @Post('register')
  async register(
    @Body() body: {
      email: string;
      password: string;
      firstname: string;
      lastname: string;
      type?: AgentType;
      emailVerified : boolean
    },
  ) {
    console.log('Received registration request:', {
      ...body,
      password: '***hidden***',
    });

    return this.authService.register(
      body.email,
      body.password,
      body.firstname,
      body.lastname,
      body.type || AgentType.AGENT,
    );
  }

@Post('login')
async login(
  @Body() body: { email: string; password: string },
  @Res({ passthrough: true }) res: Response
) {
  const user = await this.authService.validateUser(body.email, body.password);
  const loginResult = await this.authService.login(user);

  const isProduction = process.env.NODE_ENV === 'production';

  // Set secure cookies
  res.cookie('access_token', loginResult.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // only secure in prod
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: 1000 * 60 * 60 * 24 * 7, // ✅ 7 days
  });
  res.cookie('user', JSON.stringify({
  email: user.email,
  firstname: user.firstname,
  lastname: user.lastname,
  type: user.type,
  _id: user._id,
}), {
  httpOnly: false,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  path: '/',
  maxAge: 1000 * 60 * 60 * 24 * 7, // ✅ 7 days
});


  return { 
    message: 'Login successful',
    user: {
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      type: user.type,
      _id: user._id,
    }
  };
}

  @Post('toggle-agent-approval')
  async toggleAgentApproval(@Body() body: { agentId: string }) {
    return this.authService.toggleAgentApproval(body.agentId);
  }

  @Get('agents')
  async getAllAgents() {
    return this.authService.getAllAgents();
  }

  @Post('verifyEmail')
  async verifyEmail(@Body() body: { email: string; emailPin: number }) {
    console.log("verify email request received:", body);
    return this.authService.verifyEmail(body.email, body.emailPin);
  }

  @Post('update-socket-id')
  async updateSocketId(
    @Body() body: { agentId: string; socketId: string }
  ) {
    console.log('Update socket ID request received -- Controller:', body);
    return this.authService.updateSocketId(body.agentId, body.socketId);
  }

  // Google OAuth endpoints
  @Get('auth/google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Initiates the Google OAuth flow
  }

@Get('auth/google/callback')
@UseGuards(AuthGuard('google'))
async googleAuthRedirect(@Req() req: any, @Res() res: Response) {
  try {
    if (!req.user) {
      throw new UnauthorizedException('Google authentication failed');
    }

    const { email, firstName, lastName } = req.user;
    
    // Check if user exists or create new one
    let user;
    try {
      user = await this.authService.finduserbyemail(email);
      // If user exists, ensure emailVerified is set to true for OAuth users
      if (!user.emailVerified) {
        await this.authService.updateemailVerificationStatus(user._id, true);
        user.emailVerified = true;
      }
    } catch (e) {
      // User doesn't exist, create new one
      const randomPassword = Math.random().toString(36).slice(-8) + 'A1!'; 
      user = await this.authService.register(
        email,
        randomPassword,
        firstName,
        lastName,
        AgentType.AGENT,
      );
      // Set emailVerified to true for OAuth registered users
      await this.authService.updateemailVerificationStatus(user._id, true);
      user.emailVerified = true;
    }

    const loginResult = await this.authService.login(user);

    // Set cookies
    res.cookie('access_token', loginResult.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // Secure in production
      sameSite: 'none', // Changed from 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/', // Important for cross-route access
    });

    res.cookie('user', JSON.stringify({
      email: user.email,
      firstname: user.firstname,
      lastname: user.lastname,
      type: user.type,
      _id: user._id,
      emailVerified:true
    }), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none', // Changed from 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
      path: '/',
    });

    // Successful redirec
    return res.redirect("https://talkbasefrontoffice-o38i.onrender.com/AppDashboard")
    
  } catch (error) {
    console.error('Google auth callback error:', error);
    // Fallback redirect if something fails
    return res.redirect(`${process.env.FRONTEND_URL || 'https://talkbase.netlify.app'}/sign-up`);
  }
}
}