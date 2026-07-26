# yuiyuiRPG 開発メモ

## プロジェクトの目的

JavaScript、HTML、CSSの学習を兼ねた、ブラウザで動くターン制RPGです。

- エントリーポイント：`index.html` → `src/main.js`
- キャラクターデータ：`character.json`
- 実行時の読み込みは `fetch()` を使うため、ブラウザで確認するときはローカルHTTPサーバー経由で開く。

## フォルダごとの役割

| 場所 | 役割 |
| --- | --- |
| `index.html` | 画面で使い続けるDOMの土台と、CSS・JavaScriptの読み込み |
| `src/main.js` | データと各クラスを生成し、`Game`へ渡して起動するエントリーポイント |
| `src/core/Game.js` | ゲームの進行、フェーズ、プレイヤー・敵・連勝数の状態管理 |
| `src/ui/Screen.js` | DOMの取得と画面描画 |
| `src/ui/InputController.js` | ボタンのクリックを受け取り、`data-action`などを`Game`へ渡す |
| `src/systems/` | 戦闘、報酬、敵生成などのゲームルール |
| `src/models/` | `Character`、`Skill`のデータと振る舞い |
| `src/data/CharacterLorder.js` | JSONデータを`Character`と`Skill`のインスタンスに変換。将来`CharacterLoader.js`へ綴りを修正する候補 |
| `src/constants/GamePhase.js` | 画面フェーズの定数 |
| `character.json` | キャラクターとスキルの初期データ |
| `images/` | 背景画像とキャラクター画像 |
| `style.css` | 全画面共通・各画面・スマートフォン表示の見た目 |

## 全体の関連と起動時の流れ

`Game`が司令塔になり、入力、ゲームルール、画面表示をつなぐ。

```text
index.html
  → style.cssを読み込む
  → src/main.jsを実行する
  → CharacterLorder.loadCharacters()
  → character.jsonをfetch()で読み込む
  → JSONのデータからSkillとCharacterを作る
  → Screen、InputController、BattleSystem、RewardSystemを作る
  → それらをGameへ渡す
  → game.start()
  → クリック処理を登録する
  → Screen.renderTitle()
```

依存関係は次のように考える。

```text
InputController
  → ユーザーが何を押したかをGameへ伝える

Game
  → 現在の状態を持ち、次に何を起こすか決める

BattleSystem・RewardSystem・EnemyFactory
  → ゲームルールに従って値を変更する

Character・Skill
  → キャラクターとスキルのデータ・振る舞いを持つ

Screen
  → Gameから受け取った最新の値をDOMへ表示する

style.css
  → bodyの画面クラスに合わせて見た目を変える
```

## HTML、Screen、CSSの分担

### `index.html`に書くもの

- ページ全体の基本構造
- どの画面でも入れ物として使うDOM
- JavaScriptから取得する`id`
- CSSを読み込む`link`
- JavaScriptを読み込む`script`

`#game-info`、`#player-status`、`#enemy-status`、`#message-area`、`#button-area`などは、画面が変わっても使い続ける入れ物。

### `Screen.js`に書くもの

- 現在の画面によって変わる文字
- プレイヤーや敵の現在HP・MP・能力値
- キャラクターやスキルの数によって増減するボタン
- ボタンの`data-action`、`data-character-index`、`data-skill-index`
- bodyに付ける画面用CSSクラス

### `style.css`に書くもの

- 色、余白、配置、背景、アニメーション
- 画面ごとの表示・非表示
- スマートフォン表示

基本の分担は次のとおり。

```text
index.html = どこに表示するかという入れ物
Screen.js  = 今、何を表示するか
style.css  = どう見せるか
Game.js    = 次に何が起きるか
```

## ボタン入力がGameへ届く流れ

`Screen`が作るボタンには`data-*`属性を付ける。

```html
<button
  data-action="use-skill"
  data-skill-index="2"
>
  スキル
</button>
```

`Game.start()`が、入力を受け取ったときに実行するコールバック関数を`InputController`へ渡す。

```js
this.inputController.setButtonClickHandler((input) => {
  this.handleAction(input);
});
```

`InputController`は`#button-area`のクリックをイベント委譲で受け取り、押されたボタンの`dataset`から値を取り出す。

```js
onButtonClick({
  action: clickedButton.dataset.action,
  characterIndex: clickedButton.dataset.characterIndex,
  skillIndex: clickedButton.dataset.skillIndex,
});
```

このオブジェクトが`Game.handleAction(input)`へ渡され、`action`に対応する処理が呼ばれる。

```text
ボタンをクリック
  → InputControllerがdata-*を取得
  → onButtonClick(input)
  → Game.start()で渡したコールバック
  → Game.handleAction(input)
  → handleSkill()などの対応する処理
```

`dataset`から取得した値は基本的に文字列なので、配列番号として使う前に`Number()`で数値へ変換する。

```js
const index = Number(skillIndex);
```

## JSONからモデルへの変換

`character.json`は保存用データ、`Character`と`Skill`はゲーム内部で扱うオブジェクト。

JSONではスネークケース、JavaScript内部ではキャメルケースを使用している。

```text
cost_mp      → costMp
hp_to_enemy  → hpToEnemy
atk_to_self  → atkToSelf
```

この変換はJavaScriptがスネークケースを使えないからではなく、JavaScript側の命名規則を統一し、外部データとゲーム内部を分けるために行う。

データ読込はクラスの`static async loadCharacters()`として実装しているため、`new`せずクラス名から呼ぶ。

```js
const characters =
  await CharacterLorder.loadCharacters();
```

## 画面クラスと`setScreenClass()`

`title-screen`や`reward-screen`はJavaScriptの変数ではなく、bodyに付けるCSSクラス名の文字列。

```js
this.setScreenClass("reward-screen");
```

実行後のブラウザ上のDOMは次のようになる。

```html
<body class="reward-screen">
```

CSSでは、対応するクラスを持つbodyの見た目を定義する。

```css
body.reward-screen {
  /* 報酬画面の見た目 */
}
```

現在の対応関係は次のとおり。

| ゲーム状態 | bodyの画面クラス |
| --- | --- |
| `GamePhase.TITLE` | `title-screen` |
| `GamePhase.PLAYER_SELECT` | `player-select-screen` |
| `GamePhase.BATTLE` | `battle-screen` |
| `GamePhase.REWARD` | `reward-screen` |
| `GamePhase.GAME_OVER` | `battle-screen`を再利用 |

`Screen.setScreenClass(screenClass)`は、古い画面クラスを全て外してから、引数で受け取った新しい画面クラスを1つ付ける共通処理。

```js
setScreenClass(screenClass) {
  document.body.classList.remove(
    "title-screen",
    "player-select-screen",
    "battle-screen",
    "reward-screen",
  );

  document.body.classList.add(screenClass);
}
```

`reward-screen`などが事前にJavaScriptで定義されている必要はない。単なる文字列であり、対応するCSSがあれば見た目が適用される。クラス内のメソッドは記述位置に関係なく呼び出せるが、共通処理なので`constructor()`の後、各`render...()`の前に置く。

`Game.phase`とbodyの画面クラスは別の役割を持つ。

```text
Game.phase       = 今どの操作を許可するか
bodyのCSSクラス = 今どの見た目を適用するか
```

## `createStatusHtml()`による共通化

プレイヤーと敵のステータスHTMLは同じ形なので、`Screen.createStatusHtml(character)`へまとめている。

```js
createStatusHtml(character) {
  return `
    <h2>${character.name}</h2>
    <p>Lv.${character.level}</p>
    <p>HP：${character.hp} / ${character.maxHp}</p>
    <p>MP：${character.mp} / ${character.maxMp}</p>
    <p>ATK：${character.atk}</p>
    <p>DEF：${character.def}</p>
  `;
}
```

`renderBattle()`からプレイヤーと敵の両方に使う。

```js
this.playerStatus.innerHTML =
  this.createStatusHtml(player);

this.enemyStatus.innerHTML =
  this.createStatusHtml(enemy);
```

`createStatusHtml()`はHTML文字列を作って返すだけで、実際にDOMへ入れて表示するのは`renderBattle()`。

## CSSカードの共通化方針

キャラクター選択の`.character-select-card`と、報酬選択の`.reward-card`には共通する見た目が多い。共通部分は`.menu-card`へまとめ、各ボタンにクラスを2つ付ける方針。

```html
<button class="menu-card character-select-card">
<button class="menu-card reward-card">
```

役割は次のように分ける。

```text
.menu-card
  = 枠線、角丸、文字色、flex、cursor、transitionなどの共通部分

.character-select-card
  = キャラクターカード固有の高さ、余白、背景、影

.reward-card
  = 報酬カード固有の高さ、余白、背景、影
```

共通CSSを先に、個別CSSを後に書く。個別クラスは必要な違いだけを上書きする。

```css
.menu-card {
  display: flex;
  flex-direction: column;
  justify-content: center;
  border: 2px solid #c99a4b;
  border-radius: 10px;
  color: #fff4cf;
  cursor: pointer;
}

.character-select-card {
  min-height: 145px;
  padding: 20px;
}

.reward-card {
  min-height: 150px;
  padding: 24px;
}
```

同じhover・activeを使う場合は、`.menu-card:hover`、`.menu-card:active`へまとめる。

## 現在のゲーム進行

```text
タイトル
  → キャラクター選択
  → 戦闘
  → 勝利：報酬選択 → 次の戦闘
  → 敗北：タイトルへ戻る
```

`Game.phase` は `GamePhase` の値で管理する。戦闘中以外で攻撃・スキルが実行されないよう、各操作の最初にフェーズを確認する。

## 実装済みの重要な仕様

### 敗北後

- `Game.handleGameOver()` は `GamePhase.GAME_OVER` にし、`Screen.renderGameOver()` を呼ぶ。
- `Screen.renderGameOver()` は通常の戦闘表示を使った後、操作ボタンを「タイトルへ戻る」ボタンだけに置き換える。
- `data-action="restart-game"` は `Game.handleAction()` で受け取り、`restartGame()` がプレイヤー、敵、連勝数をリセットしてタイトル画面を描画する。

### 通常攻撃とスキル

- 通常攻撃と、成功したスキル使用の後の共通処理は `Game.handleBattleAfterPlayerAction(playerMessage)` にまとめている。
- このメソッドは、プレイヤー行動後の勝敗判定、敵ターン、敵ターン後の勝敗判定、戦闘画面の更新を担当する。
- MP不足などスキル使用に失敗した場合は敵ターンに進めず、`playerResult.message` だけを表示する。

### 戦闘メッセージ

- プレイヤーと敵の行動メッセージは、`Game.handleBattleAfterPlayerAction()` の最後で次の形にする。

```js
`${playerMessage}\n${enemyResult.message}`
```

- `Screen.renderBattle()` は `textContent` でメッセージを表示する。HTMLとして解釈させる必要はない。
- `style.css` の `body.battle-screen .message-area` には `white-space: pre-line;` がある。これにより上記の改行文字が画面上でも改行として表示される。

### 連勝数

- 連勝数の状態は `Game.winStreak`。
- 勝利時に `handleVictory()` で1増やす。
- `Screen.renderBattle(player, enemy, message, winStreak)` は4番目の引数を受け取り、`#game-info` に `連勝数：<数値>` と表示する。
- `renderBattle()` を呼ぶ全ての場所で `this.winStreak` を渡す。初回戦闘、通常攻撃・スキル後、MP不足時、報酬後の次戦闘、ゲームオーバーを確認する。
- 戦闘画面では `#game-info` を隠さない。`style.css` の `body.battle-screen #game-info` でロゴの下に配置している。

### キャラクター画像

- キャラクターPNGは透過情報を持つ。画像周囲を紺色にしないため、`.character-area` に戦闘用の不透明背景を追加しない。
- 敵画像は `style.css` の `body.battle-screen #enemy-image { transform: scaleX(-1); }` により左右反転して表示する。画像ファイルをキャラクターごとに複製する必要はない。
- `images/assassin.png` は左右反転済み。元画像は `images/assassin-original.png` に保存されている。

## 画面を修正するときのルール

- `Game.js` は「何が起きるか」を決める。DOM操作は基本的に書かない。
- `Screen.js` は「どう表示するか」を担当する。
- JavaScriptから見た目を大量に指定せず、画面フェーズ用のbodyクラス（例：`battle-screen`）とCSSに任せる。
- ボタンには `data-action` を付け、`InputController` のイベント委譲で扱う。

## コードを読みやすく保つルール

- 変数名・関数名から役割が分かる名前を使う。配列は複数形、真偽値は `is...` / `can...` を目安にする。
- クラス名は大文字始まり（PascalCase）、関数・変数は小文字始まり（camelCase）に統一する。現在の`CharacterLorder`は`CharacterLoader`へ綴りを修正する候補。
- 字下げは半角スペース2つ、`if (`、`,` の後の空白などの書式を統一する。
- 同じ処理が複数の場所にあり、一緒に修正する必要がありそうなら、役割が分かる関数へ切り出す。
- UI用の文字列とゲームルールを混ぜず、数値バランスは必要に応じて定数へまとめる。
- コードを読めば分かる「何をしているか」のコメントは減らし、コードだけでは分からない「なぜそうするか」をコメントに残す。
- 行数を減らすことだけを目的にせず、処理の流れが追いやすいことを優先する。

詳しい学習用ガイドは `clean-code-guide.md` を参照する。

## 整理済みの内容

- 未参照だった`Screen.leaveBattle()`を削除した。
- `renderPlayerSelect()`と重複していた`Screen.leaveTitle()`を削除した。
- 未使用だった`handleVictory(battleMessage)`の引数を削除し、`handleVictory()`にした。
- `Screen.renderReward()`の未使用だった`player`引数を削除した。
- `Screen.setScreenClass()`を追加し、画面クラスの切り替えを共通化した。
- `Screen.createStatusHtml()`を追加し、プレイヤーと敵のステータスHTMLを共通化した。
- 画面の表示・非表示は、JavaScriptの`style.display`よりbodyの画面クラスとCSSへ任せる形に整理した。
- `Game.handleBattleAfterPlayerAction()`に、プレイヤーや敵が自傷スキルで倒れた場合の判定を追加した。
- `src/data/fileChange.js`から、静的メソッドを持つデータ読込クラスへ名前を変更した。

## 現在の要確認・整理候補

- `CharacterLorder`は`Loader`の綴りではないため、ファイル名・クラス名・importを`CharacterLoader`へそろえる。
- `Game.handleBattleAfterPlayerAction()`のプレイヤー行動後に、`enemyDefeated`の同じ条件が2回ある。古い`this.handleVictory(playerMessage)`側を整理する。
- 相打ちの場合を勝利・敗北・引き分けのどれにするか決める。現在の`getBattleResult()`はプレイヤー敗北を先に判定する。
- 魔法使いの`Mana Drain`が同名で2件あるため、重複か別スキルか確認する。
- `Skill.description`は読み込んでいるが画面で未使用。スキル説明として表示するか、不要ならデータ・モデル・読込処理から削除する。
- スキル習得失敗時の`result.message`が画面に表示されないため、表示方法を決める。
- `.character-select-card`と`.reward-card`の共通部分を`.menu-card`へまとめる。
- `style.css`内の重複した`body.battle-screen .battle-area`を1つにまとめる。
- `BattleSystem.normalAttack()`が返す`damage`は現在呼び出し側で未使用。攻撃エフェクトなどで使わないなら返却値から削除できる。
- `character.json`へ画像パスを持たせると、キャラクター追加時に画像対応表を別ファイルで直す必要がなくなる。
- `index.html`のJavaScriptですぐ上書きされる仮文字は、初期表示のちらつきを避けるため空にできる。

## 確認手順

変更後は最低限、次を確認する。

1. JavaScript構文：`node --check src/core/Game.js` と `node --check src/ui/Screen.js`
2. タイトル → キャラクター選択 → 戦闘へ進める
3. 通常攻撃、スキル成功、MP不足のスキルを試す
4. プレイヤー勝利、報酬選択、次の戦闘を試す
5. プレイヤー敗北後、「タイトルへ戻る」を試す
6. プレイヤーまたは敵が自傷スキルで倒れた場合の勝敗を確認する
7. 戦闘画面で連勝数、プレイヤー・敵の向き、メッセージ改行を確認する
8. bodyに複数の画面クラスが同時に残っていないことを確認する
9. ブラウザの開発者ツールConsoleにエラーがないことを確認する

## 作業時の注意

- 現在の作業ツリーには未コミットのユーザー変更がある。依頼と無関係な変更を戻したり、削除したりしない。
- 画像を置き換えるときは、依頼が明確な場合を除き元ファイルをバックアップする。
- `images/suraimu.png` の削除など、既存の差分は他の作業による可能性があるため、勝手に復元しない。
