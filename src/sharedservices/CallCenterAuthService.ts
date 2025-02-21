import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { ConfigService } from '@nestjs/config'; // Import ConfigService
import { AppAgent, AppAgentDocument } from '../models/AppAgentSchema';

@Injectable()
export class CallCenterAuthService {
  constructor(
    @InjectModel(AppAgent.name)
    private appAgentDocument: Model<AppAgentDocument>,
    private jwtService: JwtService,
    private configService: ConfigService, // Inject ConfigService
  ) {}

  async register(email: string, password: string): Promise<{ accessToken: string; refreshToken: string }> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.appAgentDocument({
      email,
      password: hashedPassword,
    });
    await newUser.save(); // Ensure we await save

    const payload = { username: email };

    // Retrieve secrets from environment variables
    const accessTokenSecret = this.configService.get<string>('JWT_SECRET');
    const refreshTokenSecret = this.configService.get<string>('JWT_REFRESH_TOKEN');

    if (!accessTokenSecret || !refreshTokenSecret) {
      throw new Error('JWT_SECRET or JWT_REFRESH_TOKEN is missing from environment variables');
    }

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload, {
      secret: accessTokenSecret,
      expiresIn: '1h', // Access token expires in 1 hour
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: refreshTokenSecret,
      expiresIn: '7d', // Refresh token expires in 7 days
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

    // Ensure JWT secret is correctly retrieved
    const accessTokenSecret = this.configService.get<string>('JWT_SECRET');
    if (!accessTokenSecret) {
      throw new Error('JWT_SECRET is missing from environment variables');
    }

    return {
      accessToken: this.jwtService.sign(payload, {
        secret: accessTokenSecret,
        expiresIn: '1h', // Set expiration time
      }),
    };
  }
}
