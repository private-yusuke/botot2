import { IDatabase } from '../database'
import * as moment from 'moment'
import * as fs from 'fs'
import config from '../../../config'
const MarkovJa = require('markov-ja')

export default class OnlyOneDatabase implements IDatabase {
  public readonly markov: any
  private unsavedPostCount: number = 0

  constructor(markov: any) {
    this.markov = markov
  }

  load() {
    try {
      this.markov.loadDatabase(fs.readFileSync(config.database.path), 'utf-8')
    } catch(e) {
      this.markov.loadDatabase('{}')
    }
  }
  save() {
    fs.writeFileSync(config.database.path, this.markov.exportDatabase(), 'utf-8')
    if(config.database.maxSize != 0) {
      const size = fs.statSync(config.database.path).size
      if(size >= config.database.maxSize) {
        console.log(`database is too big. max = ${config.database.maxSize} <= size = ${size}.`)
        console.log('renaming the database file.')
        fs.renameSync(config.database.path, `${config.database.path}-${moment().unix()}.json`)
        this.markov.loadDatabase('{}')
      }
    }
  }
  onInterrupted() {
    this.save()
  }
}