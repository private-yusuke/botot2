import IModule from "../module";
import MessageLike from "../message-like";
import { api } from "../misskey";

export default class EmojiListModule implements IModule {
  public readonly priority = 0;
  public readonly name = "emojiList";
  public readonly commands = [
    {
      name: "emoji",
      desc: "Display all the emojis registered in the instance.",
    },
  ];
  meta: any;

  public install() {
    api("meta")
      .then((meta) => meta.json())
      .then((json) => (this.meta = json))
      .catch((err) => console.error(err));
  }

  public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
    if (cmd[0] == "emoji") {
      let emojiTexts = this.meta.emojis.map((i) => `:${i.name}:`);
      let maxNoteTextLength = this.meta.maxNoteTextLength;

      let k = 0;
      while (k < emojiTexts.length) {
        let emojiText = "";
        while (true) {
          if (k == emojiTexts.length) break;
          if (emojiText.length + emojiTexts[k].length <= maxNoteTextLength) {
            emojiText += emojiTexts[k];
          } else break;
          k++;
        }
        await msg.reply(emojiText, "emojis");
      }
      return true;
    }
    return false;
  }
}
