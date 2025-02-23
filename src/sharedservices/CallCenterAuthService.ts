import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppAgent, AppAgentDocument } from '../models/AppAgentSchema';
import { AgentType } from '../models/AppAgentSchema';

@Injectable()
export class CallCenterAuthService {
  constructor(
    @InjectModel(AppAgent.name)
    private appAgentDocument: Model<AppAgentDocument>,
    private jwtService: JwtService,
  ) {}

  async register(
    email: string, 
    password: string,
    firstname: string,
    lastname: string,
    type: AgentType = AgentType.AGENT
  ): Promise<{}> {
    // Check if trying to register as admin
    if (type === AgentType.ADMIN) {
      // Check if admin already exists
      const existingAdmin = await this.appAgentDocument.findOne({ type: AgentType.ADMIN });
      if (existingAdmin) {
        throw new ConflictException('An admin account already exists');
      }
    }

    // Check if email already exists
    const existingUser = await this.appAgentDocument.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new this.appAgentDocument({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      type,
      isApproved: type === AgentType.ADMIN ? true : false, // Admin is automatically approved
    });
    await newUser.save();

    const payload = { 
      username: email,
      type: type,
      sub: newUser._id 
    };

    // Generate access token and refresh token
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_TOKEN,
      expiresIn: '7d',
    });

    return { 
      accessToken, 
      refreshToken,
      type: type // Return type in response
    };
  }

  async validateUser(email: string, password: string): Promise<AppAgent> {
    const user = await this.appAgentDocument.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.type === AgentType.AGENT && !user.isApproved) {
      throw new UnauthorizedException('Your account is pending admin approval');
    }

    if (await bcrypt.compare(password, user.password)) {
      return user;
    }
    
    throw new UnauthorizedException('Invalid email or password');
  }

  async login(user: AppAgent): Promise<{ accessToken: string, type: AgentType }> {
    const payload = { 
      email: user.email, 
      sub: user._id,
      type: user.type 
    };
    return {
      accessToken: this.jwtService.sign(payload),
      type: user.type
    };
  }

  async toggleAgentApproval(agentId: string): Promise<AppAgent> {
    const agent = await this.appAgentDocument.findById(agentId);
    if (!agent) {
      throw new UnauthorizedException('Agent not found');
    }
    if (agent.type === AgentType.ADMIN) {
      throw new UnauthorizedException('Cannot modify approval status of admin accounts');
    }

    // Toggle current status
    agent.isApproved = !agent.isApproved;
    await agent.save();

    return agent;
  }

  // Add method to get all agents
  async getAllAgents(): Promise<AppAgent[]> {
    return this.appAgentDocument.find({ type: AgentType.AGENT }).exec();
  }

  async findUserById(userId: string): Promise<AppAgent> {
    const user = await this.appAgentDocument.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
