import IModule from "../module";
import MessageLike from "../message-like";
import Ai from "../ai";

export default class RandomChoiceModule implements IModule {
  public readonly priority = 0;
  public readonly name = "randomChoice";
  public readonly commands = [
    {
      name: "choose",
      desc: "choose one from given N choices",
    },
  ];

  public install(_: Ai) {}

  public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
    if (cmd[0] == "choose") {
      if (cmd.length < 2) {
        msg.reply("Usage: /choose <choice 1> <choice 2> ... <choice N>");
      } else {
        let choice = cmd.length - 1;
        msg.reply(cmd[Math.floor(Math.random() * choice) + 1]);
      }
      return true;
    }
    return false;
  }
}
