import Ai from './ai'
import MessageLike from './message-like'
import { User } from './misskey';

export default interface ICommand {
  name: string,
  desc?: string
}