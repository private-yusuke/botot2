import IModule from "../module"
import MessageLike from "../message-like"
import Ai from "../ai"

export default class DiceModule implements IModule {
	public readonly priority = 0
	public readonly name = "dice"
	public readonly commands = [
		{
			name: "dice",
			desc: "3d6 -> /dice 3 6"
		}
	]
	private ai: Ai

	public install(ai: Ai) {
		this.ai = ai
	}

	public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
		if (cmd[0] == "dice") {
			if (cmd.length < 3) {
				msg.reply("Usage: /dice <amount> <max>")
			} else {
				let amount = Number(cmd[1]),
					m = Number(cmd[2])
				if (
					isNaN(amount) ||
					amount <= 0 ||
					isNaN(m) ||
					m <= 0 ||
					amount > 500
				) {
					msg.reply("Argument is invalid. (amount > 0, max > 0, amount <= 500)")
					return true
				}
				let res = []
				for (let i = 0; i < amount; i++) {
					res.push(Math.ceil(Math.random() * m))
				}
				let text = `Result:\n${res.join(" ")}`
				if (text.length > 1000) text = `Too long result`
				msg.reply(text)
			}
			return true
		}
		return false
	}
}
