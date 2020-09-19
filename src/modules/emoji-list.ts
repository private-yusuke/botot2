import IModule from "../module"
import MessageLike from "../message-like"
import Ai from "../ai"

export default class EmojiListModule implements IModule {
	public readonly priority = 0
	public readonly name = "emojiList"
	public readonly commands = [
		{
			name: "emoji",
			desc: "Display all the emojis registered in the instance."
		}
	]
	private ai: Ai

	public install(ai: Ai) {
		this.ai = ai
	}

	public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
		if (cmd[0] == "emoji") {
			let emojiTexts = this.ai.meta.emojis.map(i => `:${i.name}:`)
			let maxNoteTextLength = this.ai.meta.maxNoteTextLength

			let lastMsg = msg
			let k = 0
			while (k < emojiTexts.length) {
				let emojiText = ""
				while (true) {
					if (k == emojiTexts.length) break
					if (emojiText.length + emojiTexts[k].length <= maxNoteTextLength) {
						emojiText += emojiTexts[k]
					} else break
					k++
				}
				let rep = await lastMsg.reply(emojiText, 'emojis')
				if (!lastMsg.isMessage)
					lastMsg = new MessageLike(this.ai, rep.createdNote, msg.isMessage)
			}
			return true
		}
		return false
	}
}
