import Ai from "./ai"
import MessageLike from "./message-like"
import { User } from "./connectors/misskey/types"

export default interface ICommand {
	name: string
	desc?: string
}
