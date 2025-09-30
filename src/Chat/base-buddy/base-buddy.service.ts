import { Injectable } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { InjectModel } from '@nestjs/mongoose';
import { Conversation, ConversationDocument } from '../../conversation/entities/conversation.entity';
import { Model } from 'mongoose';
import { ChatMessage, ChatMessageDocument } from '../../models/ChatMessageSchema';
import ChatEvent from '../../models/ChatEvent';
import { AppClient, AppClientDocument } from '../../models/AppClientSchema';
import { WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ClientInformation } from '../../client-information/entities/client-information.entity';
import { ClientInformationDocument } from '../../models/ClientInformationSchema';
import { ChatGatewayCallCenter } from '../ChatGatewayCallCenter';
import { ChatGatewayWidget } from '../ChatGatewayWidget';

@Injectable()
export class BaseBuddyService {
      private ai: GoogleGenAI;

  constructor(
        @InjectModel(ClientInformation.name) private clientInformationModel: Model<ClientInformationDocument>,
        @InjectModel(ChatMessage.name) private chatMessageModel: Model<ChatMessageDocument>,
        @InjectModel(Conversation.name) private conversationModel: Model<ConversationDocument>,
        @InjectModel(AppClient.name) private appClientModel: Model<AppClientDocument>,
  ) {
    this.ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });
  }
    @WebSocketServer()
      server: Server;
      client: Socket;

  async askBaseBuddy(productInfo: string, userQuestion: string, ConversationId: string): Promise<ChatMessage> {
    console.log("----------------------------------------------")
    console.log("askBaseBuddy Was Called");
    console.log("this is the productInfo", productInfo);
    console.log("this is the userQuestion", userQuestion);
    console.log("this is the ConversationId", ConversationId);
    console.log("----------------------------------------------")

  const config = {
    temperature: 0.3,
    topP: 0.9,
    thinkingConfig: {
      thinkingBudget: -1,
    },
      responseMimeType: 'text/plain',
      systemInstruction: [
        {
          text: `You are BaseBuddy, a friendly and knowledgeable e-commerce chatbot assistant specialized in helping users learn everything about the product they are currently viewing.

Each time you respond, you will be given detailed product information, including the product's name, description, price, sizes, dimensions, colors, materials, features, availability, and any other relevant details. You will also receive a link to the product page.

Your main goal is to answer the user's questions accurately and helpfully based on the information provided about the product. Users may ask about:

- Price and discounts
- Available sizes and fit
- Dimensions (height, width, weight, etc.)
- Material and quality
- Usage instructions or care tips
- Availability and stock status
- Shipping options and delivery time
- Return policy related to the product
- Compatibility with other products or accessories
- Any other specific feature or detail about the product

### Important:
If the user asks a question that:
- Is unrelated to the product
- Involves external topics or personal opinions
- Is out of scope for a shopping assistant

Then respond only with:

**"I'm sorry, I can't assist you with that question. Would you like to reformulate it, or should I transfer you to an active agent?"**

Do not attempt to guess, explain unrelated topics, or provide generic advice.
Always be polite, clear, and concise. Use simple language and avoid technical jargon unless the user uses it first.

If the user provides the product link, assume you have the full product data available for that link.

Example conversation:

User: "What sizes does this jacket come in?"  
BaseBuddy: "This jacket is available in sizes S, M, L, and XL."

User: "Is it machine washable?"  
BaseBuddy: "Yes, the jacket is machine washable. Please use a gentle cycle and cold water."

User: "How much does it weigh?"  
BaseBuddy: "The jacket weighs approximately 800 grams."

User: "what time is it now in newyork?"  
BaseBuddy: "I'm sorry, I can't assist you with that question. Would you like to reformulate it, or should I transfer you to an active agent?"

If the user asks unrelated questions, gently steer the conversation back to the product or offer general assistance.

Remember, your responses should always be based on the product information you have been provided and never guess or invent details.

---

When responding, always keep the user's context and product details in mind, and aim to make their shopping experience easy and enjoyable.
`,
        },
      ],
    };

    const model = 'gemini-2.5-flash';
    console.log('🧪 Final prompt sent to Gemini:\n', `Product Info: ${productInfo}\n\nUser Question: ${userQuestion}`);

    const contents = [
      {
        role: 'user',
        parts: [
          {
            text: 
            `This Is Product InfoLink : ${productInfo} and this is 
            User Question: ${userQuestion}`,
          },
        ],
      },
    ];

    // You can also add previous conversation history in contents if needed

    const response = await this.ai.models.generateContentStream({
      model,
      config,
      contents,
    });

    let answer = '';
    for await (const chunk of response) {
      answer += chunk.text;
    }
    const appclient = await this.appClientModel.findOne({ humanIdentifier: ConversationId }).exec();
    const chatMessage : ChatMessage = new this.chatMessageModel({
      message: answer.trim(),
      chatEvent:ChatEvent.MessageFromBaseBuddyToClient,
      identifier: ConversationId,
      isSentBy_BB: true,
      appClient: appclient,
    })
    console.log("this is the ai response", chatMessage.message);
    console.log("----------------------------------------------")
    console.log("----------------------------------------------")
    console.log("----------------------------------------------")
    console.log("this is the appclient",appclient)

    const conversation = await this.conversationModel.findOne({ AppClientID: chatMessage.appClient.humanIdentifier }).exec();
    if (!conversation) {
    console.log("the conversation was not found ---BaseBuddy service ")
    const newConversation = new this.conversationModel({
    messages: [chatMessage],
    AppClientID:chatMessage.appClient.humanIdentifier,
    })
    newConversation.save();
    return chatMessage;
    }else{
    console.log("the conversation was found ---BaseBuddy service")
    conversation.messages.push(chatMessage);
    conversation.save();
    return chatMessage;
    }
  }
}
