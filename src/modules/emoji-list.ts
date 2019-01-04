import IModule from '../module'
import MessageLike from '../message-like'
import Ai from '../ai';
import { User } from '../misskey'

export default class EmojiListModule implements IModule {
  public readonly priority = 0
  public readonly name = 'emojiList'
  private ai: Ai

  public install(ai: Ai) {
    this.ai = ai
  }

  public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
    if(cmd[0] == 'emoji') {
      let req = await this.ai.api('meta')
      let json = await req.json()
      let resultText = json.emojis.map(i => `:${i.name}:`).join("")
      msg.reply(resultText, 'Showing the emojis registered in this instance…')
      return true
    }
    return false
  }
}