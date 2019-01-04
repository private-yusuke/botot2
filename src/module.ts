import Ai from './ai'
import MessageLike from './message-like'
import { User } from './misskey';

export default interface IModule {
  name: string
  priority: number
  install?: (ai: Ai) => void
  onMention?: (msg: MessageLike) => boolean
  onNote?: (note: any) => void
  onFollowed?: (user: User) => void
  onInterrupted?: () => void
  onCommand?: (msg: MessageLike, cmd: string[]) => Promise<boolean>
  info?: () => string
}