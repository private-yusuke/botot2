import IModule from "../module"
import Ai from "../ai"
import MessageLike from "../message-like"

export default class GreetingModule implements IModule {
	public readonly priority = 2
	public readonly name = "greeting"
	private ai: Ai

	public install(ai: Ai) {
		this.ai = ai
	}

	public onMention(msg: MessageLike) {
		if (!msg.text) return false
		let m = msg.text.match(/(おはよう|こんにちは|こんばんは|おやすみ)/)
		if (m) {
			msg.reply(`${m[1]}〜!`)
			return true
		} else return false
	}
}
