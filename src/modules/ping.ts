import IModule from "../module";
import MessageLike from "../message-like";

export default class PingModule implements IModule {
  public readonly priority = 0;
  public readonly name = "ping";
  public readonly commands = [
    {
      name: "ping",
    },
  ];

  public install() {}

  public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
    if (cmd[0] == "ping") {
      msg.reply("PONG!");
      return true;
    }
    return false;
  }
}
