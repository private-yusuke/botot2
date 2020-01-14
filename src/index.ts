import config from './config'
import Ai from './ai'
import Modulez from './modules'
import fetch from 'node-fetch'
import IModule from './module';
import { MisskeyClient } from './connectors/misskey/client';

console.log('>>> starting... <<<')

let ai: Ai<any, any, any>
async function main() {
  const client = new MisskeyClient(config.apiURL, config.i)
  const me = await client.getProfile()
  console.log(`I am ${me.name}(@${me.screenName})!`)
  const modules: IModule[] = []
  Modulez.forEach(M => {
    const m = new M()
    if(config.modules.indexOf(m.name) >= 0) modules.push(m)
  })
  modules.sort((a, b) => {
    return b.priority - a.priority
  })

  ai = new Ai(client, me, modules)
}

process.on('SIGINT', async () => {
  console.log('Received interrupt signal, exiting...')
  await ai.onInterrupt()
})
main()