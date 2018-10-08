import IModule from "../module";
import Ai from "../ai";
import MessageLike from "../message-like";

export default class OthelloRedirectModule implements IModule {
  public readonly required = false
  public readonly name = 'othelloRedirect'
  public readonly priority = 2
  private ai: Ai

  public install(ai: Ai) {
    this.ai = ai
  }

  public onMention(msg: MessageLike): boolean {
    if(!msg.text) return false
    if(msg.text.match(/(オセロ|リバーシ)/)) {
      msg.reply('cc: @ai')
      return true
    } else return false
  }
}