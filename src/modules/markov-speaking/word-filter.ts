import * as XML from "xml2js";
import config from "../../config";
import * as fs from "fs";

export default class WordFilter {
  private filterURL: string;
  private initialized: boolean = false;
  public ngwordDict: string[] = [];
  public okwordDict: string[] = [];

  constructor() {
    this.filterURL = config.markovSpeaking.wordFilterURL;
  }
  private async fetchDict() {
    let dictReq;
    let filterXML;
    let badWords: string[] = [];
    let okWords: string[] = [];

    if (this.filterURL) {
      console.info(`Fetching abusive word list from ${this.filterURL}`);
      dictReq = await fetch(this.filterURL);

      let dictStr = await dictReq.text();
      filterXML = await XML.parseStringPromise(dictStr);

      for (let i of filterXML.housouKinshiYougoList.dirtyWord) {
        badWords.push(i.word[0]._);
        badWords.push(i.word[0].$.reading);
      }
    }

    for (let filePath of config.markovSpeaking.wordFilterFiles) {
      console.info(`Loading filtered word list from ${filePath}`);
      const fileContent = fs.readFileSync(filePath, "utf-8");
      for (let word of fileContent.split("\n")) {
        let m = word.match("//");
        if (m) {
          /*
           * "abra // cadabra" => "abra"
           */
          word = word.substring(0, m.index).trim();
        }
        if (!word) continue;
        if (word.startsWith("-")) okWords.push(word.substr(1));
        else badWords.push(word);
      }
    }
    // ["ok", "test", "ng", "good", "hey"]
    // => ['ok', 'ng', 'hey', 'test', 'good']
    // sorted by the length of the element
    badWords.sort((a, b) => a.length - b.length);
    okWords.sort((a, b) => a.length - b.length);
    this.ngwordDict = badWords;
    this.okwordDict = okWords;
  }

  async init() {
    if (!config.markovSpeaking.filtering) return false;
    try {
      await this.fetchDict();
    } catch (e) {
      console.error("Couldn't initialize the word filter.");
      console.error(e);
    }

    if (process.env.DEBUG_NGFILTER) {
      console.log(this.ngwordDict);
      console.log(this.okwordDict);
    }
    this.initialized = true;
    return true;
  }

  isBad(str: string) {
    if (!this.initialized) return false;
    if (!str) return false;
    let k = 0;
    while (k < str.length) {
      // ng: ["ab"]
      // ok: ["abc"]
      // str: "abc cba" => false
      // str: "ab cba" => true

      let ok: boolean = false;
      for (let okword of this.okwordDict) {
        if (str.length - k < okword.length) break;
        if (str.slice(k, k + okword.length) == okword) {
          k += okword.length;
          ok = true;
          break;
        }
      }
      if (ok) continue;

      for (let ngword of this.ngwordDict) {
        if (str.length - k < ngword.length) break;
        if (str.slice(k, k + ngword.length) == ngword) {
          if (config.markovSpeaking.wordFilterLog) console.log(`*B: ${ngword}`);
          return true;
        }
      }
      k++;
    }

    // safe!
    return false;
  }
}
