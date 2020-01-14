import { IUser } from "../interface/user"

export class MisskeyUser implements IUser {
	constructor(public name: string, public screenName: string) {}
}
