import * as XML from 'xml2js'
import config from '../../config'
import fetch from 'node-fetch'
import * as fs from 'fs'

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

    for(let filePath of config.markovSpeaking.wordFilterFiles) {
      console.info(`Loading filtered word list from ${filePath}`)
      const fileContent = fs.readFileSync(filePath, 'utf-8')
      for(let word of fileContent.split('\n')) {
        let m = word.match('//')
        if(m) {
          /*
           * "abra // cadabra" => "abra"
          */
          word = word.substring(0, m.index).trim()
        }
        if(word) dict.push(word)
      }
    }
    return dict
  }

  async init() {
    if(!config.markovSpeaking.filtering) return false
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
    return true
  }

  isBad(str: string) {
    if(this.initialized && this.wordRegex.exec(str)) return true
    else return false
  }
}