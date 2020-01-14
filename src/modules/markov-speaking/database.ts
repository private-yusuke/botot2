import Ai from "../../ai"
import config from "../../config"

export type Database = "onlyOne" | "flexible"
export interface IDatabase {
	markov: any
	load: () => void
	save: () => void
	updateSave: () => void
	reset: () => void
	onInterrupted: () => void
	size: () => number
}
