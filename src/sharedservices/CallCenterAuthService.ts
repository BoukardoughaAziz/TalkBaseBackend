import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppAgent, AppAgentDocument } from '../models/AppAgentSchema';

@Injectable()
export class CallCenterAuthService {
  constructor(
    @InjectModel(AppAgent.name)
    private appAgentDocument: Model<AppAgentDocument>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<{}> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.appAgentDocument({
      email,
      password: hashedPassword,
    });
    newUser.save();
    const payload = { username: email };

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN , // Use a separate secret for refresh token
      expiresIn: '7d', // Refresh token expiration time
    });
 
    return { accessToken, refreshToken };
  }

  async validateUser(email: string, password: string): Promise<AppAgent> {
    const user = await this.appAgentDocument.findOne({ email });
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    throw new UnauthorizedException('Invalid email or password');
  }

  async login(user: AppAgent): Promise<{ accessToken: string }> {
    const payload = { email: user.email, sub: user._id };
    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}
