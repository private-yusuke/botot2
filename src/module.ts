import Ai from './ai'
import MessageLike from './message-like'
import { User } from './misskey';

export default interface IModule {
  name: string
  priority: number
  install?: (ai: Ai) => void
  onMention?: (msg: MessageLike) => boolean
  onNote?: (note: any) => void
  onReplyThisModule?: (msg: MessageLike, data?: any) => void
  onFollowed?: (user: User) => void
  onInterrupted?: () => void
}