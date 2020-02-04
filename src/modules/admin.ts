import IModule from "../module"
import Ai from "../ai"
import MessageLike from "../message-like"
import * as os from "os"
import { isOp } from "../misskey"
import { now } from "moment"
import config from "../config"

export default class AdminModule implements IModule {
	public readonly priority = 10
	public readonly name = "admin"
	public readonly commands = [
		{
			name: "info",
			desc: "Display the status of the bot"
		},
		{
			name: "help",
			desc: "Display all the comamnds with descriptions"
		},
		{
			name: "halt",
			desc: "Shutdown the bot"
		}
	]
	private ai: Ai

	public install(ai: Ai) {
		this.ai = ai
	}
	public getUptime(): string {
		return Math.floor(process.uptime()) + "s"
	}
	public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
		if (cmd[0] == "info") {
			let res = `\`\`\`
Modules: ${this.ai.modules.map(i => `${i.name}(${i.priority})`).join(", ")}
Uptime: ${this.getUptime()}
${process.title} ${process.version} ${process.arch} ${process.platform}
Version: ${config.version}(${config.revision})
`
			res += this.ai.modules
				.filter(i => typeof i.info == "function")
				.map(i => i.info())
				.join("\n")
			res += "\n```"
			msg.reply(res)
			return true
		} else if (cmd[0] == "help") {
			let res = "```\n"
			this.ai.modules.forEach(v => {
				if (v.commands) {
					v.commands.forEach(c => {
						if (c.desc) res += `/${c.name}: ${c.desc}\n`
						else res += `/${c.name}\n`
					})
				}
			})
			res += "```"
			msg.reply(res)
			return true
		} else if (cmd[0] == "halt") {
			if (isOp(msg.user)) {
				await msg.reply(`OK trying to shutdown……\n${now().toLocaleString()}`)
				this.ai.onInterrupt()
			} else {
				msg.reply("You don't have a permission to exec /halt.")
			}
		}
		return false
	}
}
