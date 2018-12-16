import IModule from "../module";
import Ai from "../ai";
import MessageLike from "../message-like";
import * as os from 'os'

export default class AdminModule implements IModule {
  public readonly priority = 10
  public readonly name = 'admin'
  private ai: Ai

  public install(ai: Ai) {
    this.ai = ai
  }
  public getUptime(): string {
    return Math.floor(process.uptime()) + 's'
  }
  public onCommand(msg: MessageLike, cmd: string[]): boolean {
    if(cmd[0] == 'info') {
      let res =
`\`\`\`
Modules: ${this.ai.modules.map(i => `${i.name}(${i.priority})`).join(', ')}
Uptime: ${this.getUptime()}
${process.title} ${process.version} ${process.arch} ${process.platform}
`
      res += this.ai.modules.filter(i => typeof i.info == 'function').map(i => i.info()).join('\n')
      res += '\n```'
      msg.reply(res)
      return true
    }
    return false
  }
}