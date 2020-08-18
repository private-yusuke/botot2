# ChangeLog

2.1.6 (2020/08/18)

---

### ✨Improvements

- Add `allowLearnCW` configuration
  - もしこの設定が偽であるならば、CW が指定された投稿が学習されないようになります。

2.1.3 (2020/05/05)

---

### ✨Improvements

- Add `headers` configuration
  - config.json で `headers: {"X-xxx": "value"}` のように指定すれば、サーバー側の API （WebSocket 除く）を叩く際にそのヘッダーをリクエストに載せるようになりました。

2.1.2 (2020/02/08)

---

### ✨Improvements

- Add `/markov delete` command
  - config.json で Op に指定されているアカウントならば、 `/markov delete` コマンドを用いることによって与えられた文章に含まれる形態素を含むチェーンをすべて削除することができます。
    - 注意点として、分かち書きされた結果含まれている助詞なども作用の対象となりますし、 MeCab 側の解析結果に依存する機能のため現在のデータベースを参考にして形態素解析の結果を予測してから利用することをおすすめします（係り受けモジュールを用いるのも一つの手かもしれません）
