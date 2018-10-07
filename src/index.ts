import config from './config'
import Ai from './ai'
import Modulez from './modules'
import fetch from 'node-fetch'
import IModule from './module';

console.log('>>> starting... <<<')

let ai: Ai
async function main() {
  let tmp = await fetch(`${config.apiURL}/i`, {
    method: 'POST',
    body: JSON.stringify({
      i: config.i
    })
  })
  let me = await tmp.json()
  console.log(`I am ${me.name}(@${me.username})!`)

  const modules: IModule[] = []
  Modulez.forEach(M => {
    const m = new M()
    if(m.name == 'autoFollow') {
      if(config.autoFollow) modules.push(m)
    } else modules.push(m)
  })
  modules.sort((a, b) => {
    return a.priority - b.priority
  })
  

  ai = new Ai(me, modules)
}

process.on('SIGINT', async () => {
  console.log('Received interrupt signal, exiing...')
  await ai.onInterrupt()
})
main()