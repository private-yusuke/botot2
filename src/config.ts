import * as moment from 'moment'
import * as Misskey from './misskey'
import { Database } from './modules/markov-speaking/database';

type Duration = {
  value: number,
  unit: moment.unitOfTime.Base
}
type LengthRange = {
  start: number,
  end: number
}

type Config = {
  i: string
  host: string
  baseURL?: string
  wsURL?: string
  apiURL?: string
  timeline: Misskey.Timeline
  timelineURL?: string
  notificationURL?: string
  intervalPost: boolean
  intervalPostDuration: Duration
  modules: {
    markovSpeaking?: boolean
    autoFollow?: boolean
    othelloRedirect?: boolean
    greeting?: boolean
  }
  database: {
    path: string
    type: Database
    saveFrequency: number
    saveDuration: Duration

    maxSize: number
  }
  sentenceLengthRange: LengthRange
  mecab: {
    commandOptions?: string
  }
  visibility: Misskey.Visibility
}

const config = require('../config.json')

config.baseURL = `https://${config.host}`
config.wsURL = `wss://${config.host}`
config.apiURL = `${config.baseURL}/api`

function getTimelineURL (config: Config) {
  switch (config.timeline) {
    case 'home':
      return `${config.wsURL}/?i=${config.i}`
    case 'local':
      return `${config.wsURL}/local-timeline?i=${config.i}`
    case 'social':
    case 'hybrid':
      return `${config.wsURL}/hybrid-timeline?i=${config.i}`
    case 'global':
      return `${config.wsURL}/global-timeline?i=${config.i}`
    default:
      console.warn('Timeline not specified correctly, using home...')
      return `${config.wsURL}/?i=${config.i}`
  }
}

config.timelineURL = getTimelineURL(config)
config.notificationURL = `${config.wsURL}/?i=${config.i}`

export default config as Config