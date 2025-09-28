import ChatDirection from '../models/ChatDirection';
import ChatEvent from '../models/ChatEvent';
import { ChatMessage } from '../models/ChatMessageSchema';
import { v4 as uuidv4 } from 'uuid';
export class SharedServicesUtil {
  public static async saveChatMessage(
    chatMessageModel,
    appClient,
    incomingChatMessage,
  ) {
    let chatMessage: ChatMessage = new ChatMessage();
    chatMessage.appClient = appClient;
    chatMessage.chatDirection =
      ChatDirection[incomingChatMessage.chatDirection];
    chatMessage.chatEvent = ChatEvent[incomingChatMessage.chatEvent];
    chatMessage.message = incomingChatMessage.message;
    chatMessage.senderId = uuidv4();
    await chatMessageModel.create([chatMessage]);
    return chatMessage;
  }
}
