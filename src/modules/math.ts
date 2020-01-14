import IModule from "../module"
import MessageLike from "../message-like"
import Ai from "../ai"
import { User } from "../misskey"
import config from "../config"
const asciimathToLaTeX = require("asciimath-to-latex")
const mj = require("mathjax-node")
const svg2png = require("svg2png")

export default class MathModule implements IModule {
	public readonly priority = 0
	public readonly name = "math"
	public readonly commands = [
		{
			name: "math atol",
			desc: "Convert AsciiMath code to LaTeX"
		},
		{
			name: "math atol-src",
			desc: "Convert AsciiMath code to LaTeX code"
		},
		{
			name: "math render",
			desc: "Render LaTeX or AsciiMath to .png file"
		}
	]
	private ai: Ai

	public size: number
	public install(ai: Ai) {
		this.ai = ai
		this.size = config.math.size
		mj.start()
	}

	async generateImage(type: string, formula: string) {
		type = type.toLowerCase()
		if (type == "latex" || type == "tex") type = "TeX"
		else if (type == "asciimath") type = "AsciiMath"
		else type == "TeX"
		let out = await mj.typeset({
			math: formula,
			format: type,
			svg: true
		})
		let image
		image = await svg2png(out.svg, {
			width: out.width.slice(0, -2) * this.size,
			height: out.height.slice(0, -2) * this.size
		})
		return image
	}
	async uploadRendered(type: string, formula: string) {
		let image = await this.generateImage(type, formula)
		if (!image) return null

		let imageRes = await this.ai.upload(image, {
			filename: "rendered.png",
			contentType: "image/png"
		})
		return imageRes
	}

	public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
		if (cmd[0] == "math") {
			switch (cmd[1]) {
				case "atol":
					if (!cmd.slice(2).join(" "))
						msg.reply("math: /math atol <AsciiMath_code>")
					msg.reply("\\(" + asciimathToLaTeX(cmd.slice(2).join(" ")) + "\\)")
					break
				case "atol-src":
					if (!cmd.slice(2).join(" "))
						msg.reply("math: /math atol-src <AsciiMath_code>")
					msg.reply(
						"```\n" + asciimathToLaTeX(cmd.slice(2).join(" ")) + "\n```"
					)
					break
				case "render":
					let file
					try {
						file = await this.uploadRendered(cmd[2], cmd.slice(3).join(" "))
					} catch (e) {
						msg.reply(`Couldn\'t process the input;\n${e}`, "error!")
						return true
					}

					if (msg.isMessage) {
						msg.reply("Rendered!", null, {
							fileId: file.id
						})
					} else
						msg.reply("Rendered! Here it is", null, {
							fileIds: [file.id]
						})
					break
				default:
					msg.reply("math: /math <atol, render>")
					break
			}
			return true
		}
		return false
	}
}
