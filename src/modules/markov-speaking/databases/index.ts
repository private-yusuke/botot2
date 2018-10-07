import FlexibleDataBase from './flexible-database'
import { IDatabase } from '../database'
import config from '../../../config';
import OnlyOneDatabase from './onlyone-database';
type Database = 'onlyOne' | 'flexible'

export default function createDatabase (type: Database, markov: any): IDatabase {
  switch(type) {
    case 'flexible':
      return new FlexibleDataBase(markov)
    case 'onlyOne':
      return new OnlyOneDatabase(markov)
    default:
      console.warn('Database not specified, using OnlyOneDatabase...')
      return new OnlyOneDatabase(markov)
  }
}