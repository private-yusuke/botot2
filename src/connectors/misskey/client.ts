import { IClient } from "../interface/client"
import { MisskeyPost } from "./post"
import { MisskeyUser } from "./user"

export class MisskeyClient implements IClient<MisskeyUser, MisskeyPost> {
	constructor(public host: string, private token: string) {}

	post(options: {
		text: string
		files: Blob[]
		replyTo: MisskeyPost
	}): Promise<MisskeyPost> {
		throw new Error("Method not implemented.")
	}

	getProfile(): Promise<MisskeyUser> {
		throw new Error("Method not implemented.")
	}
}
