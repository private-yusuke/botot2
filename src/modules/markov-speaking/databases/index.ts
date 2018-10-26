import FlexibleDataBase from './flexible-database'
import { IDatabase } from '../database'
import config from '../../../config';
import OnlyOneDatabase from './onlyone-database';
import Ai from '../../../ai';
type Database = 'onlyOne' | 'flexible'

export default function createDatabase (type: Database, markov: any, ai: Ai): IDatabase {
  switch(type) {
    case 'flexible':
      return new FlexibleDataBase(markov, ai)
    case 'onlyOne':
      return new OnlyOneDatabase(markov, ai)
    default:
      console.warn('Database not specified, using OnlyOneDatabase...')
      return new OnlyOneDatabase(markov, ai)
  }
}