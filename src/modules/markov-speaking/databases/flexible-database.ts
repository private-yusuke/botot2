import { IDatabase } from '../database'
import * as moment from 'moment'
import config from '../../../config'
import * as fs from 'fs'
const MarkovJa = require('markov-ja')

export default class FlexibleDataBase implements IDatabase {
  public readonly markov: any
  public readonly config: any
  private readonly duration: any
  private intervalObj: NodeJS.Timer

  constructor(markov: any) {
    this.markov = markov
    this.duration = config.database.saveDuration
    this.intervalObj = setInterval(() => {
      this.save()
    }, moment.duration(this.duration[0], this.duration[1]).asMilliseconds());
  }

  load() {
    try {
      this.markov.loadDatabase(fs.readFileSync(config.database.path), 'utf-8')
    } catch(e) {
      this.markov.loadDatabase('{}')
    }
  }
  save() {
    fs.writeFileSync(`${config.database.path}-${moment().unix()}.json`, this.markov.exportDatabase(), 'utf-8')
    console.log('database successfully saved')
  }

  onInterrupted() {
    clearInterval(this.intervalObj)
    this.save()
  }
}