# botot2

[![Compile](https://github.com/private-yusuke/botot2/workflows/Compile/badge.svg)](https://github.com/private-yusuke/botot2/actions?query=workflow%3A"Compile")

Misskey インスタンス上で動作するチャットボットです。

- 日本語の文章を形態素解析して学習し、リプライが飛んできたら支離滅裂な返答をします。
- 与えられた日本語の文章の係り受け木を描画します。
- 与えられた Asciimath または LaTeX 形式の数式を描画します。

A chatbot that works on Misskey instances.

## Install

> You need to have MeCab and CaboCha installed on your computer.

1. `$ git clone https://github.com/private-yusuke/botot2`
2. `$ cp config-sample.json config.json`
3. `$ mkdir db`
4. `$ nano config.json`
   - replace `i` with your token
5. `$ npm install`
6. `$ npm run build`
7. `$ npm start`
   - You can use `forever start --killSignal=SIGINT built/` instead.

## Modules

| 内部名(name)     | 説明(Description)                                                                                |
| ---------------- | ------------------------------------------------------------------------------------------------ |
| admin            | 管理者向けモジュール (module for administrator)                                                  |
| auto-follow      | フォロバ自動化 (automatic follow-back)                                                           |
| dice             | サイコロをふる (roll dices)                                                                      |
| emoji-list       | インスタンスに登録された絵文字の列挙 (emoji list)                                                |
| greeting         | 挨拶を返す (respond with greeting)                                                               |
| kakariuke-graph  | 係り受け木の描画 (render the structure of Japanese sentence)                                     |
| markov-speaking  | 学習して返答する (learn Japanese sentences and generate replies)<br />contains filtering feature |
| math             | 数式の描画 (render Asciimath, LaTeX), AsciiMath -> LaTeX conversion                              |
| othello-redirect | contains "othello" -> reply "cc: @ai"                                                            |
| ping             | /ping -> pong!                                                                                   |
| sushi            | ランダム絵文字 (respond with a random emoji)                                                     |

各モジュールは`config.json`でオンオフの設定ができます。
Each module can be either enabled or disabled by modifying `config.json`.

`config.json`のその他の設定については、各モジュールのソースコードを参照してください。
For other settings in `config.json`, please see the source codes of each module.

---

Issue や Pull Request は大歓迎！気づいたことがあれば、ぜひ積極的に教えてください。
We appreciate your issues and pull requests! If you have noticed something, please tell me asap.

Twitter: [@public_yusuke](https://twitter.com/public_yusuke)
