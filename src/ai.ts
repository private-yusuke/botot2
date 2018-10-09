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

  private timelineConnection: any
  private messageConnection: any
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

  private init() {
    this.modules.forEach(m => m.install(this))
    this.timelineConnection = new ReconnectingWebSocket(config.timelineURL, [], {
      WebSocket: WebSocket
    })

    this.timelineConnection.addEventListener('open', () => {
      console.log('timeline WebSocket connected')
    })
    this.timelineConnection.addEventListener('close', () => {
      if(this.isInterrupted) this.timelineConnection.close()
      else this.timelineConnection.reconnect()
    })
    this.timelineConnection.addEventListener('message', message => {
      const msg = JSON.parse(message.data)

      this.onNote(msg)
    })

    this.messageConnection = new ReconnectingWebSocket(config.notificationURL, [], {
      WebSocket: WebSocket
    })

    this.messageConnection.addEventListener('open', () => {
      console.log('notification WebSocket connected')
    })
    this.messageConnection.addEventListener('close', () => {
      if(this.isInterrupted) this.messageConnection.close()
      else this.messageConnection.reconnect()
    })
    this.messageConnection.addEventListener('message', message => {
      const msg = JSON.parse(message.data)
      if(msg.type == 'messaging_message' && msg.body.userId != this.account.id) this.onMessage(msg)
      else if(msg.type == 'followed' && msg.body.id != this.account.id) this.onFollowed(msg.body)
    })
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

    let res: ReturnType<IModule['onMention']>
    this.modules.filter(m => typeof m.onMention == 'function').some(m => {
      res = m.onMention(msg)
      return res === true || typeof res === 'object'
    })
    
  }

  private onMessage(msg: any) {
    switch(msg.type) {
      case 'mention':
        if(msg.body.userId == this.account.id || msg.body.isBot) return
        if(msg.body.text.startsWith(`@${this.account.username}`)) {
          this.onMention(new MessageLike(this, msg.body, false))
        }
        break
      case 'reply':
        if(msg.body.userId == this.account.id || msg.body.isBot) return
        this.onMention(new MessageLike(this, msg.body, true))
        break
      default: break
    }
  }
  
  private onFollowed(user: User) {
    this.modules.filter(m => typeof m.onFollowed == 'function').forEach(m => {
      return m.onFollowed(user)
    })
  }

  async onInterrupt() {
    this.isInterrupted = true
    this.messageConnection.close()
    this.timelineConnection.close()
    this.modules.filter(m => typeof m.onInterrupted == 'function').forEach(m =>
      m.onInterrupted()
    )
    process.exit(0)
  }
}