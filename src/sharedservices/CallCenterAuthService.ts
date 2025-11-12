import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { AppAgent, AppAgentDocument, AgentType } from '../models/AppAgentSchema';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '../sharedservices/MailServices'; 

@Injectable()
export class CallCenterAuthService {
  constructor(
    @InjectModel(AppAgent.name)
    private appAgentDocument: Model<AppAgentDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private readonly MailServices: MailerService
  ) {}

  async register(
    email: string, 
    password: string,
    firstname: string,
    lastname: string,
    type: AgentType = AgentType.AGENT
  ): Promise<{ message: string }> {
    console.log("register service reached");

    const existingUser = await this.appAgentDocument.findOne({ email });
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const SignUpPin = Math.floor(100000 + Math.random() * 900000);
    console.log("SignUpPin: ", SignUpPin);

    const newUser = new this.appAgentDocument({
      email,
      password: hashedPassword,
      firstname,
      lastname,
      type,
      isApproved: type === AgentType.ADMIN, 
      emailPin : SignUpPin,
    });
    console.log("New user created: ", newUser);
    await newUser.save();



    await this.MailServices.sendEmail(
      email,
      'Welcome to Our Service',
      `Hello ${firstname},\n\nThank you for registering. Your account has been created successfully.\n\nYour Sign-Up PIN is: ${SignUpPin}\n\nPlease keep it safe and do not share it with anyone.\n\nBest regards,\nYour Service Team`
    );

    return { message: 'Registration successful. Please login.' };
  }

  async validateUser(email: string, password: string): Promise<AppAgent> {
    console.log("validateUser--- SERVICE")
    const user = await this.appAgentDocument.findOne({ email });
    if(user){
    console.log("User found ");
    }
    if (!user) {
      console.log("User not found ");
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isApproved) {
      console.log("User is not approved: ", user);
      throw new UnauthorizedException('Your account is pending admin approval');
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      console.log("Password does not match");
      throw new UnauthorizedException('Invalid email or password');
    }

    return user;
  }

  async login(user: AppAgent): Promise<{ accessToken: string; refreshToken: string; type: AgentType }> {
    console.log("Received login request --- Service")
    
    const payload = { 
      email: user.email, 
      sub: user._id,
      type: user.type 
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_EXPIRE'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('JWT_REFRESH_SECRET') || this.configService.get<string>('JWT_SECRET'),
      expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRE') || '30d',
    });
    // console.log("Access Token: ", accessToken);
    // console.log("Refresh Token: ", refreshToken);

    return {
      accessToken,
      refreshToken,
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

    agent.isApproved = !agent.isApproved;
    await agent.save();

    return agent;
  }

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


    async verifyEmail(email: string, emailPin: number): Promise<AppAgent> {
      const user = await this.appAgentDocument.findOne({ email });
      console.log("this is the user found: ", user);
      const pin= Number(emailPin);
      console.log("this is the type of the pin: ", typeof pin);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      if (user.emailPin !== Number(emailPin)) {
        throw new UnauthorizedException('Invalid email verification PIN');
      }
      if(user.emailPin===pin){
      user.emailVerified = true;
      await user.save();
      }
      return user;
    }


    async finduserbyemail(email: string): Promise<AppAgent> {
      const user = await this.appAgentDocument.findOne({ email });
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      return user;
    }


    async updateemailVerificationStatus(userId: string, status: boolean): Promise<AppAgent> {
      const user = await this.appAgentDocument.findById(userId);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }
      user.emailVerified = status;
      await user.save();
      return user;
    }

  async updateSocketId(agentId: string, socketId: string): Promise<AppAgent> {
    console.log('Update socket ID request received -- Controller:', { agentId, socketId });
    const user = await this.appAgentDocument.findById(agentId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    user.SocketId = socketId;
    await user.save();
    return user;
  }



  //code for oauth 
  async registerOAuth(email: string, firstname: string, lastname: string): Promise<AppAgent> {
  const newUser = new this.appAgentDocument({
    email,
    firstname,
    lastname,
    password: '', // No password needed for OAuth
    emailVerified: true,
    isApproved: true,
    type: AgentType.AGENT,
  });

  await newUser.save();
  return newUser;
}



  async sendMarketingEmail(recipients: [string], subject: string, text: string, html: string) {
  this.MailServices.sendMarketingEmail(recipients , subject,text,html);
  }




}