import fetch from 'node-fetch'
import config from './config'
import IModule from './module'
import { User, Reaction } from './misskey'
import * as WebSocket from 'ws'
const ReconnectingWebSocket = require('reconnecting-websocket')
import MessageLike from './message-like';
const delay = require('timeout-as-promise')

export default class Ai {
  public account: User
  private connection: any
  private modules: IModule[] = []
  private isInterrupted: boolean = false

  constructor(account: User, modules: IModule[]) {
    this.account = account
    this.modules = modules

    this.init()
  }

  public api(endpoint: string, body?: any) {
    const url = `${config.apiURL}/${endpoint}`
    const data = JSON.stringify(Object.assign({
      'i': config.i
    }, body))
    return fetch(url, {
      method: 'POST',
      body: data
    })
  }

  private initConnection() {
    this.connection = new ReconnectingWebSocket(config.streamURL, [], {
      WebSocket: WebSocket
    })
    
    this.connection.addEventListener('open', () => {
      console.log('WebSocket connected')
    })
    this.connection.addEventListener('close', () => {
      if(this.isInterrupted) this.connection.close()
      else this.initConnection()
    })
    this.connection.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      this.onData(msg)
    })
    function generateData(id: string, channel: string) {
      return {
        type: "connect",
        body: {
          id: id,
          channel: channel
        }
      }
    }
    const timelineData = generateData('timeline', config.timelineChannel)
    const messageData = generateData('message', 'messagingIndex')
    const mainData = generateData('main', 'main')
    this.connection.send(JSON.stringify(timelineData))
    this.connection.send(JSON.stringify(messageData))
    this.connection.send(JSON.stringify(mainData))
  }

  private init() {
    this.modules.forEach(m => m.install(this))
    this.initConnection()
  }

  private onData(msg: any) {
    console.log(`${msg.body.type} from ${msg.body.id}`)
    switch(msg.type) {
      case 'channel': 
        switch(msg.body.id) {
          case 'timeline':
            this.onNote(msg.body)
            break
          case 'message':
            if(msg.body.type == 'message' && msg.body.userId != this.account.id) this.onMessage(msg.body.body)
            break
          case 'main':
            if(msg.body.type == 'followed' && msg.body.id != this.account.id) this.onFollowed(msg.body.body)
            break
          default: break
        }
        break
      default:
        break
    }
  }

  private onNote(msg: any) {
    const body = msg.body
    if(body.userId == this.account.id) return
    const reply = body.reply || { userId: 'none' }
    if((body.text || '').indexOf(`@${this.account.username}`) >= 0 || reply.userId == this.account.id) {
      this.onMention(new MessageLike(this, body, false))
    }
    if(body.user.isBot) return
    this.modules.filter(m => typeof m.onNote == 'function').forEach(m => {
      return m.onNote(body)
    })
  }

  private async onMention(msg: MessageLike) {
    if(msg.isMessage) {
      this.api('messaging/messages/read', {
        messageId: msg.id
      })
    } else {
      let reaction: Reaction
      if(msg.user.isBot) reaction = 'angry'
      else reaction = 'like'
      await delay(1000)
      this.api('notes/reactions/create', {
        noteId: msg.id,
        reaction: reaction
      })
    }
    if(msg.user.isBot) return
    await delay(1000)
    console.log('came here')

    let res: ReturnType<IModule['onMention']>
    this.modules.filter(m => typeof m.onMention == 'function').some(m => {
      res = m.onMention(msg)
      return res === true || typeof res === 'object'
    })
    
  }

  private onMessage(msg: any) {
    this.onMention(new MessageLike(this, msg, true))
  }
  
  private onFollowed(user: User) {
    this.modules.filter(m => typeof m.onFollowed == 'function').forEach(m => {
      return m.onFollowed(user)
    })
  }

  async onInterrupt() {
    this.isInterrupted = true
    this.connection.close()
    this.modules.filter(m => typeof m.onInterrupted == 'function').forEach(m =>
      m.onInterrupted()
    )
    process.exit(0)
  }
}