import { SenderType } from "./SenderType"

export interface MessageReaction {
  id: string
  emoji: string
  userId: string
  userType: SenderType
  timestamp: Date
}