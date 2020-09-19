# ChangeLog

2.2.0 (2020/09/19)

---

### ✨Improvements

- Configuable `delay`
  - bot が返信するまでの間隔を、`config.json` の `delay` を変更することで弄れるようになりました。
- Pagination of `/emoji` is now implemented

2.1.9 (2020/09/11)

---

### 🐛Bug fix

- Update `node-cabocha`
  - for details, please check [this issue](https://github.com/fourseasonslab/node-cabocha/issues/1).

2.1.8 (2020/09/06)

---

### ✨Improvements

- Changed how resetting the learned database works by adding `attenuationRate` configuration
  - 減衰率の値を今までの出現回数に掛けられた値の小数点以下切り捨てが新たなデータベースにおける出現回数となります。その値が0になったときは、それに対応する 3-gram の組は削除されます。

2.1.7 (2020/08/19)

---

### 🐛Bug fix

- Visibility setting on the interval posts is working correctly now

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
