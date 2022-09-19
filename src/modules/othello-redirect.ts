import IModule from "../module";
import MessageLike from "../message-like";

export default class OthelloRedirectModule implements IModule {
  public readonly name = "othelloRedirect";
  public readonly priority = 2;

  public install() {}

  public onMention(msg: MessageLike): boolean {
    if (msg.text.match(/(オセロ|リバーシ|othello|reversi|Othello|Reversi)/)) {
      msg.reply("cc: @ai");
      return true;
    } else return false;
  }
}
