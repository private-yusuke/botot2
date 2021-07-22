const fs = require("fs")
const { execFileSync } = require("child_process")
const meta = require("./package.json")

let gitRev = execFileSync("git", ["rev-parse", "--short", "HEAD"])
	.toString()
	.trim()

fs.writeFileSync(
	"./built/meta.json",
	JSON.stringify({ version: meta.version, revision: gitRev }),
	"utf-8"
)
