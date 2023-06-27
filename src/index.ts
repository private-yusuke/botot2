import config from "./config";
import Ai from "./ai";
import Modulez from "./modules";
import IModule from "./module";
import { User } from "./misskey";

console.log(">>> starting... <<<");

let ai: Ai;
async function main() {
  let tmp = await fetch(`${config.apiURL}/i`, {
    method: "POST",
    body: JSON.stringify({
      i: config.i,
    }),
    headers: {
      "Content-Type": "application/json",
      ...config.headers,
    },
  });
  let me = (await tmp.json()) as User; // Force convert to misskey.User
  console.log(`I am ${me.name}(@${me.username})!`);
  console.log(`Version: ${config.version}(${config.revision})`);
  me.host = config.host;

  ai = new Ai(me);
}

process.on("SIGINT", async () => {
  console.log("Received interrupt signal, exiting...");
  await ai.onInterrupt();
});
main();
