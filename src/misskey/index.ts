import Visibility from "./visibility"
import Timeline from "./timeline"
import User from "./user"
import Reaction from "./reaction"
import Channel from "./channel"
import config from "../config"

function generateUserId(user: User): string {
	let res: string = user.username
	if (user.host) res += `@${user.host}`
	else res += `@${config.host}`
	return res
}
function isOp(user: User): boolean {
	return config.op.indexOf(generateUserId(user)) >= 0
}
function isBlocked(user: User): boolean {
	return config.markovSpeaking.blocked.indexOf(generateUserId(user)) >= 0
}

export {
	Visibility,
	Timeline,
	User,
	Reaction,
	Channel,
	generateUserId,
	isOp,
	isBlocked
}
