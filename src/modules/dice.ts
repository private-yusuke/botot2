import IModule from '../module'
import MessageLike from '../message-like'
import Ai from '../ai';

export default class DiceModule implements IModule {
  public readonly priority = 0
  public readonly name = 'dice'
  private ai: Ai

  public install(ai: Ai) {
    this.ai = ai
  }

  public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
    if(cmd[0] == 'dice') {
      if(cmd.length < 3) {
        msg.reply('Usage: /dice <amount> <max>')
      } else {
        let amount = Number(cmd[1]), m = Number(cmd[2])
        if(amount == NaN || amount <= 0 || m == NaN || m <= 0) {
          msg.reply('Argument is invalid')
          return true
        }
        let res = []
        for(let i = 0; i < amount; i++) {
          res.push(Math.ceil(Math.random() * m))
        }
        msg.reply(`Result:\n${res.join(' ')}`)
      }
      return true
    }
    return false
  }
}