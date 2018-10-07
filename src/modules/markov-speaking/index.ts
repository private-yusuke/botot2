import IModule from '../../module'
import MessageLike from '../../message-like'
import Ai from '../../ai';
import { User } from '../../misskey'
import { IDatabase } from './database';
import createDatabase from './databases';
import config from '../../config';
import { Body } from 'node-fetch';
const MarkovJa = require('markov-ja')

export default class MarkovSpeakingModule implements IModule {
  public readonly priority = 1
  public readonly required = false
  public readonly name = 'markovSpeaking'
  private ai: Ai
  private markov: any
  private database: IDatabase

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
    this.database = createDatabase(config.database.type, this.markov)
    this.database.load()
  }

  public onNote(note: any) {
    if(note.text) this.markov.learn(note.text.replace(/(@.+)?\s/, ''))
    console.log(`${note.user.name}(@${note.user.username}): ${note.text}`)
  }
  public onMention(msg: MessageLike): boolean {
    if(msg.text) this.markov.learn(msg.text.replace(/(@.+)?\s/, ''))
    if(msg.isMessage) {

    } else {
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
    }
    return true
  }

  public onInterrupted() {
    this.database.onInterrupted()
  }

}