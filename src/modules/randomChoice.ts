import IModule from "../module"
import MessageLike from "../message-like"
import Ai from "../ai"
import config from "../config"

export default class DiceModule implements IModule {
	public readonly priority = 0
	public readonly name = "choose"
	public readonly commands = [
		{
			name: "choose",
			desc: "choose one from given N choices"
		}
	]
	private ai: Ai

	public install(ai: Ai) {
		this.ai = ai
	}

	public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
		if (cmd[0] == "choose") {
			if (cmd.length < 2) {
				msg.reply("Usage: /choose <choice 1> <choice 2> ... <choice N>")
			} else {
				let choice = Object(cmd).length - 1
				msg.reply(cmd[Math.floor(Math.random() * choice) + 1])
			}
			return true
		}
		return false
	}
}
