import IModule from "../module"
import MessageLike from "../message-like"
import Ai from "../ai"
import config from "../config"

export default class SuruModule implements IModule {
	public readonly priority = 0
	public readonly name = "suru"
	public readonly commands = [
		{
			name: "suru",
			desc: "return yes or no"
		}
	]

	private ai: Ai

	public install(ai: Ai) {
		this.ai = ai
	}

	public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
		if (cmd[0] == "suru") {
			const yesnoInt = this.getRandomInt(0, 1)

			// 0 を no とする
			const resMessageList = yesnoInt === 0 ? config.suru.no : config.suru.yes

			const choiceInt = this.getRandomInt(0, resMessageList.length - 1)
			const choice = resMessageList[choiceInt]
			msg.reply(choice)
			return true
		}
		return false
	}

	private getRandomInt(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1)) + min
	}
}
