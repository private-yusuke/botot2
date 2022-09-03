import IModule from "../module";
import MessageLike from "../message-like";
import Ai from "../ai";
const Cabocha = require("node-cabocha");
const cabocha = new Cabocha();
const graphviz = require("graphviz");

export default class KakariukeGraphModule implements IModule {
  public readonly priority = 0;
  public readonly name = "kakariukeGraph";
  public readonly commands = [
    {
      name: "kakariuke(abbr: ka)",
      desc: "Generate a directed graph for kakariuke(Ja)",
    },
  ];
  private ai!: Ai;

  public install(ai: Ai) {
    this.ai = ai;
  }
  cabochaParsePromise(sentence: string): Promise<any> {
    return new Promise((resolve) => {
      cabocha.parse(sentence, (result) => {
        resolve(result);
      });
    });
  }
  graphvizOutputPromise(graph: any, type: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      graph.output(
        type,
        (data) => {
          resolve(data);
        },
        (err) => {
          reject(err);
        }
      );
    });
  }
  public async onCommand(msg: MessageLike, cmd: string[]): Promise<boolean> {
    if (cmd[0] == "kakariuke" || cmd[0] == "ka") {
      if (cmd.length == 1) {
        msg.reply("Usage: /kakariuke <sentence>");
      } else {
        let sentence = cmd.slice(1).join("");
        let cabochaed = await this.cabochaParsePromise(sentence);
        let graph = graphviz.digraph("G");
        if (cabochaed["depRels"].length > 1) {
          cabochaed["depRels"].forEach((chunk, index) => {
            if (chunk[0] != -1) {
              graph.addNode(`${chunk[1]}${index}`, { label: chunk[1] });
              let out = cabochaed["depRels"][chunk[0]][1];
              graph.addNode(`${out}${chunk[0]}`, { label: out });
              graph.addEdge(`${chunk[1]}${index}`, `${out}${chunk[0]}`);
            }
          });
        } else {
          let node = cabochaed["depRels"][0][1];
          graph.addNode(node);
          graph.addEdge(node, node);
        }

        let resImage = await this.graphvizOutputPromise(graph, "png");
        let imageRes = await this.ai.upload(resImage, {
          filename: "graph.png",
          contentType: "image/png",
        });

        if (msg.isMessage) {
          msg.reply("描画しました！", undefined, {
            fileId: imageRes.id,
          });
        } else
          msg.reply("描画しました！！", undefined, {
            fileIds: [imageRes.id],
          });
      }
      return true;
    }
    return false;
  }
}
