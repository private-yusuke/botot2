import Ai from "./ai"
import { User } from "./misskey"
import config from "./config"
const delay = require("timeout-as-promise")

export default class MessageLike {
	private ai: Ai
	private messageOrNote: any
	public isMessage: boolean

	public get id(): string {
		return this.messageOrNote.id
	}
	public get user(): User {
		return this.messageOrNote.user
	}
	public get text(): string {
		return this.messageOrNote.text
	}
	public get replyId(): string {
		return this.messageOrNote.replyId
	}

	constructor(ai: Ai, messageOrNote: any, isMessage: boolean) {
		this.ai = ai
		this.messageOrNote = messageOrNote
		this.isMessage = isMessage
	}

	public async reply(text: string, cw?: string, meta?: any) {
		if (text == null) return null
		if (cw == null && text.length > config.cwStart) cw = "Too long result"

		await delay(config.delay)
		if (this.isMessage) {
			let obj = {
				userId: this.user.id,
				text: text,
				...meta
			}
			return await (await this.ai.api("messaging/messages/create", obj)).json()
		} else {
			let a = await this.ai.api("notes/create", {
				replyId: this.messageOrNote.id,
				text: text,
				cw: cw,
				visibility: this.messageOrNote.visibility,
				...meta
			})
			return await (await a).json()
		}
	}
}
