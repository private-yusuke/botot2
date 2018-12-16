import IModule from '../../module'
import MessageLike from '../../message-like'
import Ai from '../../ai';
import { User, generateUserId } from '../../misskey'
import { IDatabase } from './database';
import createDatabase from './databases';
import config from '../../config';
import * as moment from 'moment'
import { Body } from 'node-fetch';
const MarkovJa = require('markov-ja')

export default class MarkovSpeakingModule implements IModule {
  public readonly priority = 1
  public readonly name = 'markovSpeaking'
  private ai: Ai
  private markov: any
  private database: IDatabase
  private intervalObj: NodeJS.Timer

  private get sentenceLength(): number {
    function getRandomInt(max) {
      return Math.floor(Math.random() * Math.floor(max))
    }
    if(config.sentenceLengthRange) {
      let l = config.sentenceLengthRange[0]
      let r = config.sentenceLengthRange[1]
      let m = r - 1
      return getRandomInt(m + 1) + 1
    } else return 1
  }

  public install(ai: Ai) {
    this.ai = ai
    this.markov = new MarkovJa()
    this.database = createDatabase(config.database.type, this.markov, this.ai)
    this.database.load()
    if(config.intervalPost) {
      let duration = moment.duration(config.intervalPostDuration.value, config.intervalPostDuration.unit).asMilliseconds()
      if(duration == 0) {
        console.error('Bad duration setting. intervalPost feature is disabled.')
      }
      this.intervalObj = setInterval(async () => {
        let text = ''
        text += this.markov.generate(this.sentenceLength).join('\n')
        let res = await this.ai.api('notes/create', {
          text: text
        })
        let json = await res.json()
        if(json.error) {
          console.error('An error occured while creating the interval post')
          console.error(json.error)
        } else {
          console.log('Successfully posted on setInterval')
        }
      }, duration)
    }
  }

  public learn(sender: User, message: string) {
    if(!this.isBlocked(sender)) {
      this.markov.learn(message.replace(/@[a-z0-9_]+(?:@[a-z0-9\.\-]+[a-z0-9])?/, ''))
    }
  }
  public isBlocked(user: User): boolean {
    return config.markovSpeaking.blocked.indexOf(generateUserId(user)) >= 0
  } 
  public onNote(note: any) {
    this.database.updateSave()
    if(note.text) this.learn(note.user, note.text)
    console.log(`${this.isBlocked(note.user) ? "><" : ""}${note.user.name}(${generateUserId(note.user)}): ${note.text}`)
  }
  public onCommand(msg: MessageLike, cmd: string[]): boolean {
    if(cmd[0] == 'markov') {
      switch(cmd[1]) {
        case 'reset':
          if(config.op.indexOf(generateUserId(msg.user)) >= 0) {
            this.database.reset()
            msg.reply('👍')
          } else {
            msg.reply('👎(You don\'t have permission)')
          }
          break
        default:
          msg.reply('markov: /markov <reset>\nOnly op-ed users can exec this command.')
          break
      }
      return true
    } else return false
  }
  public onMention(msg: MessageLike): boolean {
    if(msg.text) this.learn(msg.user, msg.text)
    if(msg.isMessage) console.log(`${this.isBlocked(msg.user) ? '><' : ''}*${msg.user.name}(@${generateUserId(msg.user)}): ${msg.text}`)
    let speech: string
    try {
      speech = this.markov.generate(this.sentenceLength).join('\n')
    } catch(e) {
      speech = '...'
    }
    if(speech.trim() == '') speech = '...'
    try {
      msg.reply(speech)
    } catch(e) {
      console.error('ERROR! Couldn\'t reply!')
      console.error(e)
      return false
    }
    return true
  }
  public info(): string {
    let res: string = `Database: ${config.database.type}, ${this.database.size()} / ${config.database.maxSize} (${(this.database.size() / config.database.maxSize) * 100}%)`
    return res
  }

  public onInterrupted() {
    this.database.onInterrupted()
  }

}