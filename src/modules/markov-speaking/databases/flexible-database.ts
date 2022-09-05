import { IDatabase } from "../database";
import * as moment from "moment";
import config, { Duration } from "../../../config";
import * as fs from "fs";
import Ai from "../../../ai";

export default class FlexibleDataBase implements IDatabase {
  public readonly markov: any;
  public readonly ai: Ai;
  private readonly duration: Duration;
  private intervalObj: NodeJS.Timer;

  constructor(markov: any, ai: Ai) {
    this.markov = markov;
    this.ai = ai;
    this.duration = config.database.saveDuration;
    this.intervalObj = setInterval(() => {
      this.save();
    }, moment.duration(this.duration.value, this.duration.unit).asMilliseconds());
  }

  load() {
    try {
      this.markov.loadDatabase(fs.readFileSync(config.database.path), "utf-8");
    } catch (e) {
      this.markov.loadDatabase("{}");
    }
  }
  save() {
    fs.writeFileSync(
      `${config.database.path}-${moment().unix()}.json`,
      this.markov.exportDatabase(),
      "utf-8"
    );
    console.log("database successfully saved");
  }
  updateSave() {}
  reset() {}
  size() {
    return this.markov.exportDatabase().length;
  }

  onInterrupted() {
    clearInterval(this.intervalObj);
    this.save();
  }
}
