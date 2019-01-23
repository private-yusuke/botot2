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
  me.host = config.host
  const modules: IModule[] = []
  Modulez.forEach(M => {
    const m = new M()
    if(config.modules.indexOf(m.name) >= 0) modules.push(m)
  })
  modules.sort((a, b) => {
    return b.priority - a.priority
  })
  console.log('module is sorted as:')
  modules.forEach(m => console.log(`${m.priority}: ${m.name}`))
  

  ai = new Ai(me, modules)
}

process.on('SIGINT', async () => {
  console.log('Received interrupt signal, exiting...')
  await ai.onInterrupt()
})
main()