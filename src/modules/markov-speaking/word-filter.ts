import * as XML from 'xml2js'
import config from '../../config'
import fetch from 'node-fetch'
export default class WordFilter {
  private filterURL: string
  private initialized: boolean = false
  public wordDict: string[]
  private wordRegex: RegExp

  constructor() {
    this.filterURL = config.markovSpeaking.wordFilterURL
  }
  async fetchDict() {
    let dictReq
    let filterXML
    let dict = []

    console.info(`Fetching abusive word list from ${this.filterURL}`)
    dictReq = await fetch(this.filterURL)
    
    let dictStr = await dictReq.text()
    filterXML = await XML.parseStringPromise(dictStr)
    
    for(let i of filterXML.housouKinshiYougoList.dirtyWord) {
      dict.push(i.word[0]._)
      dict.push(i.word[0].$.reading)
    }
    return dict
  }

  async init() {
    try {
      this.wordDict = await this.fetchDict()
    } catch(e) {
      console.error('Couldn\'t initialize the word filter.')
      console.error(e)
    }
    let regexStr = '('
    for(let i = 0; i < this.wordDict.length; i++) {
      regexStr += this.wordDict[i]
      if(i != this.wordDict.length - 1) regexStr += '|'
    }
    regexStr += ')'
    this.wordRegex = RegExp(regexStr)

    this.initialized = true
  }

  isBad(str: string) {
    if(this.wordRegex.exec(str)) return true
    else return false
  }
}