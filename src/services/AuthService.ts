import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppAgent, AppAgentDocument } from '../models/AppAgentSchema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(AppAgent.name) private userModel: Model<AppAgentDocument>,
    private jwtService: JwtService,
  ) {}

  async register(email: string, password: string): Promise<AppAgent> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ email, password: hashedPassword });
    return newUser.save();
  }

  async validateUser(email: string, password: string): Promise<AppAgent> {
    const user = await this.userModel.findOne({ email }); 
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
