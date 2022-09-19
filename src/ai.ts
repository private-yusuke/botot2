import config from "./config";
import IModule from "./module";
import * as WebSocket from "ws";
import { User, Reaction, generateUserId, api } from "./misskey";
import * as moment from "moment";
const ReconnectingWebSocket = require("reconnecting-websocket");
import MessageLike from "./message-like";
import * as delay from "timeout-as-promise";
import { assertProperty } from "./util/assert-property";

export default class Ai {
  public account: User;
  private connection: any;
  modules: IModule[] = [];
  private isInterrupted: boolean = false;
  meta: any;

  constructor(account: User, modules: IModule[]) {
    this.account = account;
    this.modules = modules;

    this.init();
  }

  private init() {
    let loadedModules: IModule[] = [];
    for (let m of this.modules) {
      try {
        m.install();
        loadedModules.push(m);
      } catch (e) {
        console.error(`An error has occured while loading module "${m.name}"`);
        console.error(e);
      }
    }
    this.modules = loadedModules;
    console.info("loaded modules:");
    this.modules.forEach((m) => console.log(`${m.priority}: ${m.name}`));

    this.initConnection();
    console.log({
      visibility: config.visibility,
      timelineChannel: config.timelineChannel,
    });

    setInterval(() => {
      this.connection.send("ping");
      if (process.env.DEBUG) console.log("ping from client");
    }, moment.duration(1, "minute").asMilliseconds());

    if (process.env.DEBUG) console.log("DEBUG enabled");
  }

  private initConnection() {
    // config.streamURL must be string, because config.streamURL is generated in config.ts
    this.connection = new ReconnectingWebSocket(
      config.streamURL as string,
      [],
      {
        WebSocket: WebSocket,
        connectionTimeout: config.connectionTimeout || 5000,
      }
    );

    this.connection.addEventListener("error", (e) => {
      console.error("WebSocket Error");
      console.error(e);
    });
    this.connection.addEventListener("open", async () => {
      console.log("WebSocket opened");
      const timelineData = generateData("timeline", config.timelineChannel);
      const messageData = generateData("message", "messagingIndex");
      const mainData = generateData("main", "main");
      if (process.env.DEBUG) {
        console.log(timelineData);
        console.log(messageData);
        console.log(mainData);
      }
      function sleep(time: number) {
        return new Promise<void>((resolve) => {
          setTimeout(() => resolve(), time);
        });
      }
      await sleep(3000);
      this.connection.send(JSON.stringify(timelineData));
      this.connection.send(JSON.stringify(messageData));
      this.connection.send(JSON.stringify(mainData));
      console.log(`WebSocket connected to ${config.timelineChannel}`);
    });
    this.connection.addEventListener("close", () => {
      if (this.isInterrupted) this.connection.close();
      console.log("WebSocket closed");
    });
    this.connection.addEventListener("message", (message) => {
      let msg: any = undefined;
      try {
        msg = JSON.parse(message.data);
      } catch {
        if (message.data == "pong" && process.env.DEBUG) {
          console.log("pong from server");
        }
        return;
      }
      if (process.env.DEBUG) console.log(msg);
      this.onData(msg);
    });
    function generateData(id: string, channel: string) {
      return {
        type: "connect",
        body: {
          id: id,
          channel: channel,
        },
      };
    }
  }

  private onData(msg: any) {
    // console.log(`${msg.body.type} from ${msg.body.id}`)
    switch (msg.type) {
      case "channel":
        switch (msg.body.id) {
          case "timeline":
            this.onNote(msg.body);
            break;
          case "message":
            if (
              msg.body.type == "message" &&
              msg.body.userId != this.account.id
            )
              this.onMessage(msg.body.body);
            break;
          case "main":
            if (msg.body.type == "followed" && msg.body.id != this.account.id)
              this.onFollowed(msg.body.body);
            break;
          default:
            break;
        }
        break;
      default:
        break;
    }
  }

  private onNote(msg: any) {
    const body = msg.body;
    if (body.userId == this.account.id) return;
    const reply = body.reply || { userId: "none" };
    let text = body.text || "";
    let reg = text.match(/^@(.+?)\s/);
    if (
      reply.userId == this.account.id ||
      text == `@${this.account.username}@${this.account.host}` ||
      (reg != null &&
        reg[1] == `${this.account.username}@${this.account.host}` &&
        text.startsWith(`@${this.account.username}@${this.account.host}`)) ||
      ((!body.user.host || body.user.host == this.account.host) &&
        (text == `@${this.account.username}` ||
          (reg != null &&
            reg[1] == this.account.username &&
            text.startsWith(`@${this.account.username}`))))
    ) {
      this.onMention(new MessageLike(body, false));
    }
    if (body.user.isBot) return;

    this.modules.filter(assertProperty("onNote")).forEach((m) => {
      return m.onNote(body);
    });
  }

  private async onMention(msg: MessageLike) {
    if (msg.isMessage) {
      api("messaging/messages/read", {
        messageId: msg.id,
      });
    } else {
      let reaction: Reaction;
      if (msg.user.isBot) reaction = "angry";
      else reaction = "like";
      await delay(config.delay);
      api("notes/reactions/create", {
        noteId: msg.id,
        reaction: reaction,
      });
    }
    if (msg.user.isBot || msg.user.id == this.account.id || !msg.text) return;
    await delay(config.delay);
    // If the mention /some arg1 arg2 ..."
    let regex = new RegExp(`(?:@${this.account.username}\\s)?\\/(.+)?`, "i");
    let r = msg.text.match(regex);
    if (r != null && r[1] != null) {
      console.log(
        `!${msg.user.name}(@${generateUserId(msg.user)}): ${msg.text}`
      );
      let funcs = this.modules.filter(assertProperty("onCommand"));
      let done = false;
      for (let i = 0; i < funcs.length; i++) {
        if (done) break;
        let res = await funcs[i].onCommand(msg, r[1].split(" "));
        if (res === true || typeof res === "object") done = true;
      }
      if (!done) msg.reply("command not found");
    } else {
      let res: ReturnType<NonNullable<IModule["onMention"]>>;
      this.modules.filter(assertProperty("onMention")).some((m) => {
        res = m.onMention(msg);
        return res === true || typeof res === "object";
      });
    }
  }

  private onMessage(msg: any) {
    this.onMention(new MessageLike(msg, true));
  }

  private onFollowed(user: User) {
    this.modules.filter(assertProperty("onFollowed")).forEach((m) => {
      return m.onFollowed(user);
    });
  }

  async onInterrupt() {
    this.isInterrupted = true;
    this.connection.close();
    this.modules.filter(assertProperty("onInterrupted")).forEach((m) => {
      m.onInterrupted();
    });
    process.exit(0);
  }
}
