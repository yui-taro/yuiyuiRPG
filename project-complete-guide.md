# yuiyuiRPG 完全理解ガイド

この文書は、現在のプロジェクトに存在するファイルを実際に読み、その役割、依存関係、全クラス・全メソッド、引数の出どころ、実行される場所、よく使われるJavaScript・HTML・CSSの機能を初心者向けにまとめたものです。

> 対象は現在ワークツリーに存在するプロジェクトファイルです。`.git`の内部ファイルはGit自身の管理情報なので対象外です。Git上では削除扱いになっている旧ファイルもありますが、現行コードからは参照されていません。

---

## 1. 最初に知っておく全体像

このゲームは、次の4つを分けて作っています。

| 分類 | 主なファイル | 役割 |
| --- | --- | --- |
| 画面の土台 | `index.html` | JavaScriptが書き換えるDOM要素を最初から置く |
| 見た目 | `style.css`、`images/` | 色、配置、背景、キャラクター画像を担当する |
| データ | `character.json`、`CharacterLorder.js` | 保存された文字・数値をゲーム用オブジェクトへ変換する |
| ゲーム処理 | `Game.js`、`systems/`、`models/` | 進行、戦闘、報酬、キャラクターの状態を担当する |
| 入出力 | `Screen.js`、`InputController.js` | DOMへの表示と、ボタンクリックの受け取りを担当する |

中心にいるのは `Game` です。

```text
InputController ──「押されたボタン」──▶ Game
Game ──「戦闘や報酬を計算して」──▶ BattleSystem / RewardSystem
Game ──「次の敵を作って」────────▶ EnemyFactory
Game ──「最新状態を表示して」────▶ Screen
Screen ──「DOMを書き換える」─────▶ index.htmlの要素
style.css ──「画面クラスに合う見た目」▶ DOM
```

### 起動時の正確な順番

```text
1. ブラウザが index.html を読む
2. <link> から style.css を読む
3. <script type="module"> から src/main.js を実行する
4. main.js が CharacterLorder.loadCharacters() を呼ぶ
5. CharacterLorder.js が fetch("./character.json") する
6. JSONの各スキルを new Skill(...) へ変換する
7. JSONの各キャラクターを new Character(...) へ変換する
8. main.js が Screen、InputController、BattleSystem、RewardSystemをnewする
9. main.js がそれら全部を new Game({...}) へ渡す
10. main.js が game.start() を呼ぶ
11. Game.start() がクリック処理をInputControllerへ登録する
12. Game.start() が Screen.renderTitle() を呼ぶ
13. Screenがbodyへ title-screen を付け、タイトルHTMLとボタンを表示する
```

### 初心者向けの重要な考え方

- `Character` は「キャラクターというものは何を持ち、何ができるか」を定義する設計図です。
- `new Character(...)` で、その設計図から実物のキャラクターを作ります。
- `Game` は「次に何を起こすか」を決める司令塔です。
- `BattleSystem` は戦闘ルールを知っていますが、現在の画面が何かは管理しません。
- `Screen` は表示方法を知っていますが、勝敗ルールは知りません。
- `InputController` は何がクリックされたかを伝えますが、その後どうするかは決めません。

この分担があるため、戦闘計算を変更するときは主に `BattleSystem.js`、見た目を変更するときは主に `Screen.js` と `style.css` を見ればよくなります。

---

## 2. フォルダ構成と全ファイル一覧

```text
yuiyuiRPG/
├─ index.html
├─ style.css
├─ character.json
├─ AGENTS.md
├─ clean-code-guide.md
├─ 流れ.md
├─ project-complete-guide.md
├─ images/
│  ├─ title-background.png
│  ├─ fight-background.png
│  ├─ warrior.png
│  ├─ mage.png
│  ├─ paladin.png
│  ├─ assassin.png
│  ├─ assassin-original.png
│  ├─ rock-golem.png
│  └─ vampire-rode.png
└─ src/
   ├─ main.js
   ├─ constants/
   │  └─ GamePhase.js
   ├─ core/
   │  └─ Game.js
   ├─ data/
   │  └─ CharacterLorder.js
   ├─ models/
   │  ├─ Character.js
   │  └─ Skill.js
   ├─ systems/
   │  ├─ BattleSystem.js
   │  ├─ EnemyFactory.js
   │  └─ RewardSystem.js
   └─ ui/
      ├─ Screen.js
      └─ InputController.js
```

おすすめの読書順は、`index.html` → `main.js` → `CharacterLorder.js` → `Character.js` / `Skill.js` → `Game.js` → `BattleSystem.js` / `RewardSystem.js` / `EnemyFactory.js` → `Screen.js` → `InputController.js` → `style.css` です。

---

## 3. `index.html` — 画面の変わらない土台

### このファイルの仕事

`index.html` はブラウザが最初に読む入口です。ゲーム画面が変わっても使い続けるDOM要素を置き、CSSとJavaScriptを読み込みます。

JavaScriptが毎回ページ全体を作り直すのではなく、次の7個の要素を使い回します。

| HTMLのID | `Screen`側の保存先 | 更新される内容 |
| --- | --- | --- |
| `game-info` | `this.gameInfo` | 連勝数 |
| `player-status` | `this.playerStatus` | プレイヤーの名前、Lv、HP、MP、ATK、DEF |
| `enemy-status` | `this.enemyStatus` | 敵の名前、Lv、HP、MP、ATK、DEF |
| `player-image` | `this.playerImage` | プレイヤー画像の`src`と`alt` |
| `enemy-image` | `this.enemyImage` | 敵画像の`src`と`alt` |
| `message-area` | `this.messageArea` | タイトル、戦闘メッセージ、報酬説明 |
| `button-area` | `this.buttonArea` | その画面で押せるボタン |

### 重要なHTML機能

#### `<!DOCTYPE html>`

「この文書は現代のHTMLです」とブラウザへ伝えます。これがないと古い互換表示になる場合があります。

#### `<html lang="ja">`

ページの主言語が日本語だとブラウザや読み上げソフトへ伝えます。

#### `<meta charset="UTF-8">`

文字コードをUTF-8にします。日本語の文字化けを防ぐために重要です。

#### viewport

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0">
```

スマートフォンで「画面幅を端末幅として扱い、最初の拡大率を1倍にする」という指定です。`style.css` のスマホ用メディアクエリが正しく働くために必要です。

#### CSSの読み込み

```html
<link rel="stylesheet" href="style.css">
```

`href` は読み込むファイルの場所です。HTMLと同じフォルダなので `style.css` だけで届きます。

#### ES Modulesの読み込み

```html
<script type="module" src="./src/main.js"></script>
```

- `src` は実行するJavaScriptファイルの場所です。
- `type="module"` により `import` と `export` が使えます。
- モジュールスクリプトはHTML解析後に実行されるため、`Screen` の `getElementById()` 実行時にはHTML要素が作られています。
- `main.js` ではトップレベルの `await` を使っており、これもモジュールだから使用できます。

### `id` と `class` の違い

- `id` はページ内で1個の要素を特定する名前です。JavaScriptの取得に向いています。
- `class` は複数要素へ同じ見た目や役割を付ける名前です。CSSでよく使います。

例として `id="player-status"` はプレイヤーステータス要素を1個だけ特定します。一方、`class="status-card"` はプレイヤーと敵の両方へ同じカードスタイルを適用します。

---

## 4. `style.css` — 全画面の見た目

### このファイルの仕事

HTMLや `Screen.js` が作った要素へ、色、サイズ、位置、背景、ホバー動作、スマートフォン表示を適用します。

### `body` の画面クラスとの関係

`Screen.setScreenClass()` が `body` に次のどれかを付けます。

| 画面 | bodyのクラス | 主なCSS |
| --- | --- | --- |
| タイトル | `title-screen` | 背景、中央タイトル、開始ボタン |
| キャラ選択 | `player-select-screen` | 3列の選択カード |
| 戦闘 | `battle-screen` | ステータス、画像、メッセージ、操作ボタン |
| 報酬 | `reward-screen` | 2列の報酬カード |
| ゲームオーバー | 見た目は`battle-screen` | 戦闘画面を再利用して戻るボタンだけ表示 |

たとえば次のセレクターは、「`body` が `battle-screen` クラスを持つときの `.status-area`」だけを対象にします。

```css
body.battle-screen .status-area {
  position: absolute;
}
```

### セレクターの読み方

| CSS | 意味 |
| --- | --- |
| `body` | `body`タグ |
| `.game` | `class="game"`を持つ要素 |
| `#game-info` | `id="game-info"`を持つ要素 |
| `.site-logo, .game-title` | どちらにも同じ指定 |
| `body.battle-screen` | `battle-screen`クラスを持つ`body` |
| `.character-area > p` | `.character-area`の直下にある`p` |
| `.menu-card:hover` | マウスが乗っている`.menu-card` |
| `.menu-card:active` | 押している最中の`.menu-card` |

### ファイル内のまとまり

1. 1〜103行付近：全画面共通のフォント、ゲーム枠、カード、ボタン
2. 105〜251行付近：タイトル画面
3. 253〜451行付近：戦闘画面
4. 453〜549行付近：キャラクター選択画面
5. 551〜655行付近：報酬画面
6. 657行以降：画面幅768px以下のスマートフォン表示

### よく使われているCSS機能

#### Flexbox

```css
display: flex;
justify-content: space-between;
align-items: flex-end;
```

要素を一列に並べます。`justify-content` は横方向、`align-items` は縦方向の配置を調整します。

#### Grid

```css
display: grid;
grid-template-columns: repeat(2, minmax(0, 1fr));
```

同じ幅の2列を作ります。戦闘ボタンと報酬カードで使います。

#### `position: absolute`

親の中の決まった位置へ要素を配置します。戦闘画面はステータス、画像、メッセージ、ボタンをゲーム画面の特定位置へ置くために多用しています。

親の `.game` には `position: relative` があるため、絶対配置の基準は戦闘画面全体です。

#### `clamp()`

```css
font-size: clamp(52px, 9vw, 120px);
```

最小52px、基本は画面幅の9%、最大120pxという可変サイズです。

#### `min()`

```css
width: min(31vw, 460px);
```

画面幅の31%と460pxの小さい方を使います。大画面で画像が大きくなりすぎません。

#### `rgba()`

最後の数値が透明度です。`rgba(0, 0, 0, 0.15)` は15%の濃さの黒です。

#### `transform: scaleX(-1)`

敵画像を左右反転します。画像ファイルを敵用に複製しなくても、プレイヤーと向き合う表示にできます。

#### `white-space: pre-line`

`Screen.renderBattle()` はメッセージを `textContent` へ入れます。文字列内の `\n` を画面上の改行として表示するのがこのCSSです。

#### メディアクエリ

```css
@media (max-width: 768px) {
  /* スマホ用上書き */
}
```

画面幅が768px以下のときだけ、中のCSSが追加適用されます。

### 画像ファイルとの関係

- `title-background.png` は `body.title-screen` の背景です。
- `fight-background.png` は戦闘、キャラ選択、報酬の背景です。
- キャラクター画像はCSSからURL指定せず、`Screen.js` が `<img>` の `src` へ設定します。

---

## 5. `character.json` — 初期キャラクターとスキルの保存データ

### このファイルの仕事

プログラムを変更せずにキャラクターの初期値やスキル効果を編集できるよう、データをJavaScriptから分離しています。

JSONはデータだけを表し、メソッドは持てません。そのため `CharacterLorder.js` が `Character` と `Skill` のインスタンスへ変換します。

### 登録キャラクター

| キャラクター | HP | MP | ATK | DEF | スキル数 |
| --- | ---: | ---: | ---: | ---: | ---: |
| 戦士 | 120 | 30 | 25 | 15 | 5 |
| 魔法使い | 80 | 80 | 10 | 10 | 6 |
| 聖騎士 | 140 | 50 | 20 | 25 | 3 |
| 暗殺者 | 90 | 60 | 18 | 10 | 3 |
| 岩ゴーレム | 200 | 40 | 25 | 40 | 3 |
| 吸血鬼の王 | 150 | 120 | 30 | 20 | 4 |

合計は6キャラクター、24スキルです。

### スキルの全フィールド

| JSON名 | JavaScript名 | 意味 |
| --- | --- | --- |
| `name` | `name` | スキル名 |
| `cost_mp` | `costMp` | 使用時に先に減らすMP |
| `hp_to_enemy` | `hpToEnemy` | 対象のHP変化。負ならダメージ、正なら回復 |
| `hp_to_self` | `hpToSelf` | 使用者のHP変化。負なら自傷、正なら回復 |
| `mp_to_enemy` | `mpToEnemy` | 対象のMP変化 |
| `mp_to_self` | `mpToSelf` | 使用者のMP変化 |
| `atk_to_enemy` | `atkToEnemy` | 対象のATK変化 |
| `atk_to_self` | `atkToSelf` | 使用者のATK変化 |
| `def_to_enemy` | `defToEnemy` | 対象のDEF変化 |
| `def_to_self` | `defToSelf` | 使用者のDEF変化 |
| `description` | `description` | 説明文。現在は読み込むが画面では未使用 |

スネークケースからキャメルケースへ変換する理由は、外部保存形式とJavaScript内部の命名規則を分けるためです。

### 現在のデータ上の注意

- 魔法使いには同名の `Mana Drain` が2件あります。
- `Character.hasSkill()` は名前だけで重複判定するため、一方を持っていればもう一方を習得できません。
- `description` は `Skill` に保存されますが `Screen` は表示していません。

---

## 6. `src/main.js` — 全部品を組み立てる入口

### このファイルの仕事

各ファイルからクラスを読み込み、必要なインスタンスを作り、最後に `Game` へ渡して起動します。プログラムの「配線担当」です。

### 1〜6行：`import`

```js
import { Game } from "./core/Game.js";
```

- `Game.js` 側の `export class Game` を読み込みます。
- `{ Game }` の名前はexport側と一致する必要があります。
- `./` は「現在の `src` フォルダから」という意味です。

### 8行：データ読み込み

```js
const characters = await CharacterLorder.loadCharacters();
```

- 実行場所：`main.js`
- 呼び出す関数の定義場所：`CharacterLorder.js`
- 戻り値：`Character[]`、つまり `Character` インスタンスの配列
- `await` によりJSON変換が終わるまで10行目へ進みません。

### 10〜15行：各インスタンスを作る

```js
const screen = new Screen();
const inputController = new InputController(screen.buttonArea);
const battleSystem = new BattleSystem();
const rewardSystem = new RewardSystem();
```

`new` はクラスの `constructor()` を実行し、新しいオブジェクトを作る演算子です。

`InputController` の引数 `screen.buttonArea` は次の順で生まれます。

```text
index.html の id="button-area"
  → new Screen()
  → Screen.constructor()
  → document.getElementById("button-area")
  → screen.buttonArea に保存
  → new InputController(screen.buttonArea)
  → InputControllerの this.buttonArea に保存
```

### 16〜22行：依存関係をGameへ渡す

```js
const game = new Game({
  characters,
  screen,
  inputController,
  battleSystem,
  rewardSystem,
});
```

波括弧はオブジェクトです。`characters` は省略記法で、実際には `characters: characters` と同じです。

`Game.constructor()` は引数を分割代入し、それぞれ `this.characters` などへ保存します。

### 24行：起動

```js
game.start();
```

定義場所は `Game.js`、実行場所は `main.js` です。この1行からタイトル表示とクリック受付が始まります。

---

## 7. `src/constants/GamePhase.js` — ゲーム状態の定数

### このファイルの仕事

現在の操作可能な場面を、打ち間違いにくい名前でまとめます。

```js
export const GamePhase = {
  TITLE: "title",
  PLAYER_SELECT: "playerSelect",
  BATTLE: "battle",
  REWARD: "reward",
  GAME_OVER: "gameOver",
};
```

`Game.js` がimportし、`this.phase` へ保存します。

たとえば次のコードは「戦闘中でなければ攻撃しない」というガードです。

```js
if (this.phase !== GamePhase.BATTLE) {
  return;
}
```

画面用CSSクラスとは別物です。

- `Game.phase`：どの操作を許可するか
- `body.classList`：どの見た目を適用するか

---

## 8. `src/data/CharacterLorder.js` — JSONをゲーム用オブジェクトへ変換

> クラス名の `Lorder` は一般的な `Loader` の綴りではありません。現在はファイル名、クラス名、importが同じなので動作します。

### import

```js
import { Character } from "../models/Character.js";
import { Skill } from "../models/Skill.js";
```

`../` は現在の `src/data/` から1階層上の `src/` へ戻る意味です。

### `static async loadCharacters()`

#### 呼び出し元

`main.js` の8行目です。

#### 引数

ありません。

#### 戻り値

`Promise<Character[]>` です。`async` 関数は必ずPromiseを返し、呼び出し側は `await` で完成した配列を受け取ります。

#### 正確な処理

1. `fetch("./character.json")` でHTTP取得する
2. `response.ok` がfalseなら `Error` を投げる
3. `response.json()` でJSON文字列をJavaScriptの配列・オブジェクトへ変換する
4. 変換後の各キャラクターデータを `for...of` で処理する
5. 各スキルを `new Skill({...})` にする
6. 完成した `Skill` を `skills.push(skill)` で配列へ追加する
7. `new Character({...})` を作る
8. `getImagePath(characterData.name)` で画像パスを決める
9. 完成した `Character` を `characters` 配列へ追加する
10. `return characters` する

### `getImagePath(characterName)`

#### 定義場所と形式

同じファイルの末尾にあるアロー関数です。

```js
const getImagePath = (characterName) => { ... };
```

#### 呼び出し元

`loadCharacters()` 内で `new Character()` の `image` 値を作るときです。

#### 引数の出どころ

`characterData.name`、つまり `character.json` の各キャラクターの `name` です。

#### 戻り値

対応する画像パス文字列です。

```js
return imageMap[characterName] ?? "";
```

- `imageMap[characterName]` は動的なキーでオブジェクトの値を取得します。
- `??` は左側が `null` または `undefined` のときだけ右側を返します。
- 未登録名なら空文字になり、画像は表示されません。

### なぜローカルHTTPサーバーが必要か

`fetch()` はブラウザのセキュリティ制限を受けます。`index.html` をファイルとして直接開く `file://` では `character.json` の取得に失敗することがあるため、HTTPサーバー経由で開きます。

---

## 9. `src/models/Skill.js` — スキル1個の設計図

### `constructor({...})`

#### 実行場所

`CharacterLorder.loadCharacters()` 内の `new Skill({...})` で実行されます。

#### 引数の出どころ

すべて `character.json` の1スキル分から変換された値です。

#### 分割代入

```js
constructor({
  name,
  costMp,
  ...
})
```

引数として渡された1個のオブジェクトから、名前付きで値を取り出します。順番に依存しないため、引数が多いスキルに向いています。

#### `this`

```js
this.name = name;
```

- 右側の `name`：constructorの引数
- 左側の `this.name`：今作っているSkillインスタンスに保存するプロパティ

### メソッドがない理由

現在の `Skill` は効果値を保存するデータモデルです。実際にHPや能力を変更する処理は `BattleSystem.useSkill()` が担当します。

---

## 10. `src/models/Character.js` — キャラクター1体の状態と基本動作

### `constructor({...})`

#### 実行される場所

- `CharacterLorder.js`：JSONから原型を作る
- `Character.clone()`：プレイヤーや敵として複製する

#### 初期値

- `level = 1`：値が渡されなければレベル1
- `skills = []`：値がなければ空配列
- `image = ""`：値がなければ空文字

`hp` は `maxHp` と現在の `hp` の両方へ保存します。`mp` も同様です。

### `isAlive()`

- 呼び出し元：`BattleSystem.getBattleResult()`
- 引数：なし
- 戻り値：`this.hp > 0` の真偽値
- HPが1以上なら `true`、0なら `false`

### `takeDamage(damage)`

- 呼び出し元：`BattleSystem.normalAttack()`、`applyTargetEffects()`、`applySelfEffects()`
- `damage` の出どころ：通常攻撃の計算値、またはスキル効果値
- 処理：現在HPからdamageを引き、0未満なら0へ固定
- 戻り値：なし。`this.hp` 自体を変更します。

### `healHp(amount)`

- 呼び出し元：`BattleSystem` のスキル処理、`RewardSystem.applyHpRecovery()`
- `amount` の出どころ：スキルの回復値、または最大HPの50%
- 処理：HPへ加算し、`maxHp` を超えたら最大値へ固定

### `healMp(amount)`

- 呼び出し元：`BattleSystem.applySelfEffects()`、`RewardSystem.applyMpRecovery()`
- 処理：MPへ加算し、`maxMp` を超えないようにする

### `useMp(cost)`

- 呼び出し元：`BattleSystem.useSkill()`
- `cost` の出どころ：選択された `Skill.costMp`
- 処理：MPからコストを引き、0未満なら0へ固定
- 実際には呼び出し前にMP不足判定があるため、正常操作では負になりません。下限固定は安全策です。

### `levelUp()`

- 呼び出し元：`RewardSystem.applyLevelUp()`
- 引数：なし
- 効果：レベル+1、最大HP+20、最大MP+10、ATK+10、DEF+10、現在HP+20、現在MP+10

最大値を増やした分だけ現在値も増やすため、この処理ではHPやMPが最大値を超えません。

### `hasSkill(skillName)`

- 呼び出し元：同じクラスの `addSkill()`
- `skillName` の出どころ：追加候補の `skill.name`
- 戻り値：同名スキルを1個でも持つなら `true`

```js
return this.skills.some(skill => skill.name === skillName);
```

`some()` は配列の要素を順番に調べ、条件が1回でもtrueならtrueを返します。

### `addSkill(skill)`

- 呼び出し元：`RewardSystem.applyStealSkill()`
- `skill` の出どころ：倒した敵の `enemy.skills[index]`
- 同名があれば `false`
- なければ `this.skills.push(skill)` して `true`

現在はSkillインスタンスそのものをプレイヤー配列へ追加します。Skillの値を戦闘中に変更する処理がないため共有しても問題化しませんが、将来Skill自体を成長・変化させるなら複製が必要です。

### `clone()`

- 呼び出し元：`Game.selectPlayer()`、`EnemyFactory.createRandomEnemy()`
- 目的：JSONから作った原型を直接傷つけない
- 戻り値：新しい `Character`

```js
skills: [...this.skills]
```

`...` はスプレッド構文です。配列自体は新しくなりますが、中のSkillインスタンスは共有する「浅いコピー」です。

`hp: this.maxHp`、`mp: this.maxMp` を渡すため、複製は全回復状態になります。

---

## 11. `src/systems/EnemyFactory.js` — 敵を選び、レベル補正する

全メソッドが `static` です。`new EnemyFactory()` を作らず、`EnemyFactory.createRandomEnemy(...)` の形で使います。

### `createRandomEnemy(characters, player, winStreak)`

#### 呼び出し元

- `Game.selectPlayer()`：最初の敵
- `Game.startNextBattle()`：報酬後の次の敵

#### 引数の出どころ

| 引数 | 作られた場所 |
| --- | --- |
| `characters` | `main.js` がJSONから読み、`Game`へ保存した `this.characters` |
| `player` | `Game.selectPlayer()` が `selectedCharacter.clone()` して作った `this.player` |
| `winStreak` | `Game.constructor()` で0、勝利時に加算される `this.winStreak` |

#### 処理

1. `filter()` でプレイヤーと名前が違うキャラクターだけを候補にする
2. 候補0件なら `throw new Error(...)`
3. ランダムな配列番号を作る
4. 候補を `clone()` して敵を作る
5. `createRandomLevel(winStreak)` で敵レベルを決める
6. `applyLevelStats(enemy)` で能力を補正する
7. 敵を返す

### `createRandomLevel(winStreak)`

- 呼び出し元：`createRandomEnemy()`
- 戻り値：1以上 `Math.max(1, winStreak)` 以下の整数

最初は連勝数0なのでレベル1です。1連勝時も上限1です。2連勝時はレベル1〜2のどちらかになります。

```js
Math.floor(Math.random() * maxLevel) + 1
```

- `Math.random()`：0以上1未満の小数
- `* maxLevel`：0以上maxLevel未満
- `Math.floor()`：小数点以下を切り捨て
- `+ 1`：1以上maxLevel以下へずらす

### `applyLevelStats(enemy)`

- 呼び出し元：`createRandomEnemy()`
- `additionalLevel = enemy.level - 1`
- 追加1レベルごとに最大HP+20、最大MP+10、ATK+5、DEF+5
- 補正後、現在HPとMPを最大値へ合わせる

---

## 12. `src/systems/BattleSystem.js` — 戦闘ルール

### `normalAttack(attacker, defender)`

#### 呼び出し元

- プレイヤー：`Game.handleNormalAttack()`
- 敵：`BattleSystem.executeEnemyTurn()`

#### 引数

- プレイヤー時：`attacker = this.player`、`defender = this.enemy`
- 敵時：`attacker = this.enemy`、`defender = this.player`

#### ダメージ

```js
const damage = Math.max(1, attacker.atk - defender.def);
```

攻撃力から防御力を引き、最低1ダメージにします。

#### 戻り値

```js
{
  damage,
  message: "..."
}
```

`Game` は現在 `message` だけ使い、`damage` は使っていません。

### `useSkill(user, target, skill)`

#### 呼び出し元

- プレイヤー：`Game.handleSkill()`
- 敵：`executeEnemyTurn()`

#### 最初の検査

- `!skill` なら存在しないスキルなので失敗
- `user.mp < skill.costMp` ならMP不足で失敗
- 失敗時は `{ success: false, message }` を返し、効果を適用しません。

#### 成功時

1. `user.useMp(skill.costMp)` で消費MPを引く
2. メッセージ配列を作る
3. `applyTargetEffects(target, skill, messages)`
4. `applySelfEffects(user, skill, messages)`
5. 改行でつないだメッセージと `success: true` を返す

対象効果が先、自分効果が後です。ただし勝敗判定は両方の適用後に `Game` が行います。

### `createEnemyAction(enemy)`

#### 呼び出し元

`executeEnemyTurn()` だけです。

#### 処理

1. `filter()` で現在MPで使えるスキルだけを作る
2. 通常攻撃1種類を加えた選択肢数を作る
3. ランダムな番号を作る
4. 最後の番号なら `{ type: "normalAttack" }`
5. それ以外なら `{ type: "skill", skill: ... }`

使えるスキルが2個なら、通常攻撃を含めた3択が同確率です。

### `executeEnemyTurn(enemy, player)`

- 呼び出し元：`Game.handleBattleAfterPlayerAction()`
- `createEnemyAction()` で行動を決める
- 通常攻撃なら `normalAttack(enemy, player)`
- スキルなら `useSkill(enemy, player, action.skill)`
- どちらの結果オブジェクトも呼び出し元の `enemyResult` へ返る

### `getBattleResult(player, enemy)`

- 呼び出し元：プレイヤー行動後と敵行動後の `Game`
- プレイヤー死亡を先に検査
- 次に敵死亡を検査
- 両者生存なら `"continue"`

現在の順番では相打ちなら `"playerDefeated"` です。

### `applyTargetEffects(target, skill, messages)`

対象側の5種類の値を処理します。

| 条件 | 実行 |
| --- | --- |
| `hpToEnemy < 0` | 絶対値をダメージとして `takeDamage()` |
| `hpToEnemy > 0` | `healHp()` |
| `mpToEnemy !== 0` | MPへ加算し、0〜最大MPへ収める |
| `atkToEnemy !== 0` | ATKへ加算 |
| `defToEnemy !== 0` | DEFへ加算 |

`messages` は `useSkill()` で作った同じ配列です。配列は参照で渡されるため、`push()` した内容が呼び出し元にも残ります。

### `applySelfEffects(user, skill, messages)`

使用者側の効果を処理します。

| 条件 | 実行 |
| --- | --- |
| `hpToSelf < 0` | 自傷ダメージ |
| `hpToSelf > 0` | HP回復 |
| `mpToSelf > 0` | MP回復 |
| `mpToSelf < 0` | MP減少、最低0 |
| `atkToSelf !== 0` | ATK変化 |
| `defToSelf !== 0` | DEF変化 |

---

## 13. `src/systems/RewardSystem.js` — 勝利報酬

### `applyLevelUp(player)`

- 呼び出し元：`Game.handleLevelUpReward()`
- `player`：`Game.this.player`
- `player.levelUp()` を呼び、結果メッセージを返す

### `applyHpRecovery(player)`

- 呼び出し元：`Game.handleHpReward()`
- `Math.floor(player.maxHp * 0.5)` で最大HPの50%を整数化
- `player.healHp(recoveryAmount)` で上限を超えず回復
- メッセージを返す

### `applyMpRecovery(player)`

HP版と同じ流れで、最大MPの50%を回復します。

### `applyStealSkill(player, enemy, skillIndex)`

#### 呼び出し元

`Game.handleSkillReward(skillIndex)` です。

#### `skillIndex` の流れ

```text
Screen.renderSkillReward()
  → data-skill-index="${index}"
  → ユーザーがクリック
  → InputControllerがdataset.skillIndexを取得（文字列）
  → Game.handleAction(input)
  → Game.handleSkillReward(skillIndex)
  → RewardSystem.applyStealSkill(..., skillIndex)
  → Number(skillIndex)
  → enemy.skills[index]
```

#### 戻り値

- 存在しないスキル：`success: false`
- 同名スキル習得済み：`success: false`
- 追加成功：`success: true`

すべてメッセージも返します。ただし現在の `Game` は失敗時の `result.message` を画面に渡さず、選択画面を再描画するだけです。

---

## 14. `src/ui/Screen.js` — DOM取得と全画面描画

### `constructor()`

#### 実行場所

`main.js` の `new Screen()` です。

#### `document.getElementById()`

```js
this.gameInfo = document.getElementById("game-info");
```

- `document`：ブラウザが現在のHTML文書を表す既存オブジェクト
- `getElementById("game-info")`：そのIDを持つ要素を1個取得する既存メソッド
- 戻り値：見つかれば `HTMLElement`、なければ `null`
- `this.gameInfo`：後のメソッドから何度も使えるよう保存したプロパティ

同じ方法で7つのDOM要素を取得します。

### `setScreenClass(screenClass)`

- 呼び出し元：各 `render...()` メソッド
- `screenClass` の値：`"title-screen"` など、呼び出し元に直接書かれた文字列
- `document.body`：HTMLの `body` 要素
- `classList.remove(...)`：古い4画面クラスを全部外す
- `classList.add(screenClass)`：今の1クラスだけ付ける

これにより複数画面のCSSが同時に適用されません。

### `createStatusHtml(character)`

- 呼び出し元：`renderBattle()` からプレイヤーと敵の2回
- 引数：`Character` インスタンス
- 戻り値：ステータス表示用HTML文字列
- DOMへ直接書き込まず、HTMLを作るだけ

### `renderTitle()`

- 呼び出し元：`Game.start()`、`Game.restartGame()`
- bodyを `title-screen` にする
- `gameInfo.textContent = ""` で連勝表示を空にする
- `messageArea.innerHTML` にタイトル用タグを作る
- `buttonArea.innerHTML` に `data-action="start-game"` のボタンを作る

### `renderPlayerSelect(characters)`

- 呼び出し元：`Game.showPlayerSelect()`
- `characters`：`Game.this.characters`
- `characters.map(...)` でキャラクター1体につきボタンHTMLを1個作る
- `.join("")` でHTML文字列を1本につなぐ
- 各ボタンへ `data-character-index="${index}"` を付ける

### `renderBattle(player, enemy, message, winStreak)`

#### 呼び出し元

- プレイヤー選択直後
- MP不足などスキル失敗時
- プレイヤーと敵の行動後
- 報酬後の次戦闘
- `renderGameOver()` の内部

#### 引数の出どころ

| 引数 | 出どころ |
| --- | --- |
| `player` | `Game.this.player` |
| `enemy` | `Game.this.enemy` |
| `message` | `Game` または戦闘システムが作った文字列 |
| `winStreak` | `Game.this.winStreak` |

#### 更新内容

- `gameInfo.textContent`：連勝数
- `playerStatus.innerHTML`：プレイヤーステータス
- `enemyStatus.innerHTML`：敵ステータス
- `playerImage.src` / `.alt`
- `enemyImage.src` / `.alt`
- `messageArea.textContent`
- `buttonArea.innerHTML`：通常攻撃と全所持スキル

### `textContent` と `innerHTML` の違い

- `textContent`：文字として表示する。`<b>` もタグではなく文字になる。外部文字列を安全に表示しやすい。
- `innerHTML`：HTMLとして解析する。ボタンや見出しを動的に作るときに必要。

戦闘メッセージはタグが不要なので `textContent`、複数のボタンや見出しを作る部分は `innerHTML` を使っています。

### `renderReward(enemy, winStreak)`

- 呼び出し元：`Game.handleVictory()`
- 勝利した敵名と連勝数を表示
- 4種類の報酬ボタンを作る
- 各 `data-action` が `Game.handleAction()` の分岐と一致する

### `renderSkillReward(enemy)`

- 呼び出し元：`Game.showSkillReward()`、スキル習得失敗時
- 倒した敵のスキルを `map()` し、選択ボタンを作る
- `data-skill-index` が後で `RewardSystem` まで渡る

### `renderGameOver(player, enemy, message, winStreak)`

1. `renderBattle(...)` を呼び、戦闘画面の見た目と状態を表示
2. `buttonArea.innerHTML` を「タイトルへ戻る」だけに置き換える

`renderBattle()` が `battle-screen` を付けるため、ゲーム状態は `GAME_OVER` でも見た目は戦闘画面です。

---

## 15. `src/ui/InputController.js` — ボタンクリックをGameへ渡す

### `constructor(buttonArea)`

- 実行場所：`main.js`
- 引数：`screen.buttonArea`
- 元のDOM：`index.html` の `id="button-area"`
- 保存先：`this.buttonArea`

### `setButtonClickHandler(onButtonClick)`

#### 呼び出し元

`Game.start()` です。

#### 引数の正体

```js
(input) => {
  this.handleAction(input);
}
```

これは `Game.start()` が作ったコールバック関数です。InputControllerはクリックされたとき、この関数を呼びます。

#### `addEventListener("click", ...)`

DOM要素へ「クリックが起きたらこの関数を実行して」と登録するブラウザの既存メソッドです。

#### `event`

ブラウザがクリック発生時に自動で渡すイベントオブジェクトです。どの要素で発生したかなどが入っています。

#### `event.target`

実際にクリックされた最も内側の要素です。ボタン内の `<span>` をクリックした場合、targetはbuttonではなくspanになる可能性があります。

#### `closest("button")`

target自身または親を上へたどり、最も近いbuttonを返します。これによりボタン内の文字やspanを押しても正しいbuttonが取れます。

#### イベント委譲

毎回作り直される各ボタンへイベントを登録せず、変わらない親の `#button-area` へ1回だけ登録しています。クリックは親へ伝わるため、あとから `innerHTML` で作ったボタンも扱えます。

#### `dataset`

HTMLの `data-*` 属性をJavaScriptから読む既存プロパティです。

| HTML | JavaScript |
| --- | --- |
| `data-action` | `dataset.action` |
| `data-character-index` | `dataset.characterIndex` |
| `data-skill-index` | `dataset.skillIndex` |

値は基本的に文字列です。そのため配列番号として使う場所で `Number()` します。

#### Gameへ渡すinput

```js
onButtonClick({
  action,
  characterIndex,
  skillIndex,
});
```

このオブジェクトが `Game.handleAction(input)` へ届きます。ボタンに存在しないdata属性は `undefined` ですが、そのactionで使わなければ問題ありません。

---

## 16. `src/core/Game.js` — 全ゲーム進行の司令塔

### `constructor({...})`

#### 実行場所

`main.js` の `new Game({...})` です。

#### 外から受け取って保存するもの

`characters`、`screen`、`inputController`、`battleSystem`、`rewardSystem` を `this` へ保存します。この渡し方を依存性注入と呼ぶことがあります。

#### 自分で初期化する状態

- `phase = GamePhase.TITLE`
- `player = null`
- `enemy = null`
- `winStreak = 0`

`null` は「今は値がない」と明示する値です。

### `start()`

1. InputControllerへクリック時のコールバックを渡す
2. `screen.renderTitle()` でタイトルを表示する

コールバック内の `this` がGameを指すのはアロー関数を使っているためです。

### `handleAction(input)`

#### 呼び出し元

`InputController` がクリック時にコールバックを呼ぶことで到達します。

#### 分割代入

```js
const { action, characterIndex, skillIndex } = input;
```

inputオブジェクトから3つの値を同名変数へ取り出します。

#### action対応表

| `data-action` | 呼ばれるGameメソッド |
| --- | --- |
| `start-game` | `showPlayerSelect()` |
| `select-player` | `selectPlayer(characterIndex)` |
| `normal-attack` | `handleNormalAttack()` |
| `use-skill` | `handleSkill(skillIndex)` |
| `reward-level-up` | `handleLevelUpReward()` |
| `reward-heal-hp` | `handleHpReward()` |
| `reward-heal-mp` | `handleMpReward()` |
| `reward-steal-skill` | `showSkillReward()` |
| `select-reward-skill` | `handleSkillReward(skillIndex)` |
| `restart-game` | `restartGame()` |

各分岐後の `return` は、残りの条件を調べず関数を終了する早期リターンです。

### `showPlayerSelect()`

- phaseを `PLAYER_SELECT` へ変更
- 全キャラクターを `Screen.renderPlayerSelect()` へ渡す

### `selectPlayer(characterIndex)`

1. `Number(characterIndex)` で文字列を数値化
2. `this.characters[index]` で原型を選ぶ
3. 存在しなければ終了
4. `clone()` してプレイヤーを作る
5. `EnemyFactory.createRandomEnemy()` で敵を作る
6. phaseを `BATTLE` へ変更
7. `Screen.renderBattle()` へ4つの引数を渡す

### `handleNormalAttack()`

1. BATTLE以外なら終了
2. `battleSystem.normalAttack(player, enemy)`
3. 戻り値を `playerResult` へ受ける
4. メッセージを `handleBattleAfterPlayerAction()` へ渡す

### `handleSkill(skillIndex)`

1. BATTLE以外なら終了
2. 文字列indexを数値化
3. `player.skills[index]` からSkillを取得
4. `battleSystem.useSkill(player, enemy, selectedSkill)`
5. 失敗なら敵ターンへ進めず、現在戦闘画面へ失敗メッセージを表示
6. 成功なら `handleBattleAfterPlayerAction(message)`

### `handleBattleAfterPlayerAction(playerMessage)`

プレイヤーの通常攻撃とスキル成功後の共通進行です。

```text
プレイヤー行動後の勝敗判定
├─ 敵死亡 → 勝利処理
├─ プレイヤー死亡 → ゲームオーバー
└─ 継続
   → 敵ターン
   → 敵ターン後の勝敗判定
      ├─ プレイヤー死亡 → ゲームオーバー
      ├─ 敵死亡 → 勝利
      └─ 継続 → 両者メッセージを表示
```

現在、`resultAfterPlayerAction === "enemyDefeated"` が連続して2回あります。最初の分岐で必ずreturnするため2個目は到達不能です。また最初は `handleVictory(playerMessage)` と呼びますが、`handleVictory()` は引数を宣言していないので値は無視されます。

### `handleVictory()`

- phaseを `REWARD` へ変更
- `winStreak` を1増やす
- `screen.renderReward(enemy, winStreak)`

### `handleGameOver(playerMessage, enemyMessage)`

- phaseを `GAME_OVER` へ変更
- プレイヤー行動、敵行動、敗北文を改行で結合
- `screen.renderGameOver(...)`

プレイヤーの自傷で倒れ、敵が行動していない場合は `enemyMessage` に空文字を渡します。

### `handleLevelUpReward()`

- REWARD以外なら終了
- `rewardSystem.applyLevelUp(player)`
- 戻ったメッセージを `startNextBattle(message)` へ渡す

### `handleHpReward()` / `handleMpReward()`

レベルアップと同じ流れで、それぞれHP・MP回復システムを呼びます。

### `showSkillReward()`

- REWARD以外なら終了
- `screen.renderSkillReward(enemy)` で敵のスキル一覧を表示
- phaseはREWARDのまま

### `handleSkillReward(skillIndex)`

1. REWARD以外なら終了
2. `rewardSystem.applyStealSkill(player, enemy, skillIndex)`
3. 失敗ならスキル一覧を再描画
4. 成功なら結果メッセージを `startNextBattle()` へ渡す

### `startNextBattle(rewardMessage)`

- 新しい敵を作る
- phaseをBATTLEへ戻す
- 報酬メッセージと新しい敵の名前・Lvを結合
- 戦闘画面を描画

### `restartGame()`

- phaseをTITLE
- playerとenemyをnull
- winStreakを0
- タイトル画面を再描画

元データの `characters` は残ります。プレイヤーや敵はcloneを使っていたため、基本的に元データは傷ついていません。

---

## 17. 1クリックが全ファイルを通る詳しい流れ

### 「始める」

```text
Screen.renderTitle()
  → buttonへ data-action="start-game"
ユーザーがクリック
  → InputControllerの#button-area click listener
  → closest("button")
  → dataset.action === "start-game"
  → onButtonClick(input)
  → Game.handleAction(input)
  → Game.showPlayerSelect()
  → phase = PLAYER_SELECT
  → Screen.renderPlayerSelect(characters)
  → body class = player-select-screen
  → style.cssの選択画面ルールが適用
```

### キャラクター選択

```text
Screenがキャラ配列のindexを data-character-index に入れる
  → クリック
  → InputControllerが文字列indexを取得
  → Game.selectPlayer(characterIndex)
  → Number()
  → characters[index]
  → clone()でプレイヤー作成
  → EnemyFactoryで敵作成
  → Screen.renderBattle()
```

### 通常攻撃

```text
button[data-action="normal-attack"]
  → InputController
  → Game.handleAction
  → Game.handleNormalAttack
  → BattleSystem.normalAttack(player, enemy)
  → enemy.takeDamage(damage)
  → Game.handleBattleAfterPlayerAction(message)
  → BattleSystem.getBattleResult
  → 継続なら BattleSystem.executeEnemyTurn
  → 敵の通常攻撃またはスキル
  → 再び getBattleResult
  → Screen.renderBattle / handleVictory / handleGameOver
```

### スキル

```text
Screenが player.skills のindexを data-skill-index に入れる
  → InputController
  → Game.handleSkill(skillIndex)
  → player.skills[Number(skillIndex)]
  → BattleSystem.useSkill(player, enemy, selectedSkill)
     ├─ 未存在・MP不足 → success:false → 敵ターンなし
     └─ 成功
        → useMp()
        → applyTargetEffects()
        → applySelfEffects()
        → success:true
  → Game.handleBattleAfterPlayerAction()
```

### 勝利から次の戦闘

```text
getBattleResult() === "enemyDefeated"
  → Game.handleVictory()
  → winStreak += 1
  → Screen.renderReward()
  → 報酬クリック
  → InputController
  → Gameの対応するhandle...Reward()
  → RewardSystem
  → Game.startNextBattle(message)
  → EnemyFactory.createRandomEnemy()
  → Screen.renderBattle()
```

---

## 18. 画像ファイルを1つずつ

### `images/title-background.png`

- 1672×941、透過なし
- `style.css` の `body.title-screen` から参照
- タイトル画面専用背景

### `images/fight-background.png`

- 1536×1024、透過なし
- 戦闘、キャラクター選択、報酬の共通背景
- `style.css` から参照

### `images/warrior.png`

- 512×512、透過あり
- `CharacterLorder.getImagePath("戦士")` が返す
- `Screen.renderBattle()` がプレイヤーまたは敵のimgへ設定

### `images/mage.png`

- 512×512、透過あり
- 魔法使い用

### `images/paladin.png`

- 512×512、透過あり
- 聖騎士用

### `images/assassin.png`

- 512×512、透過あり
- 暗殺者用
- 現在のゲームで表示する左右反転済み画像

### `images/assassin-original.png`

- 512×512、透過あり
- 暗殺者画像の元向きバックアップ
- 現行コードから直接参照されない

### `images/rock-golem.png`

- 512×512、透過あり
- 岩ゴーレム用

### `images/vampire-rode.png`

- 512×512、透過あり
- 吸血鬼の王用
- `CharacterLorder.js` の文字列も同じ綴りなので動作する

キャラクター画像の周りには透明部分があります。`.character-area` へ不透明背景を付けないことで自然に背景へ重なります。敵画像はCSSで常に左右反転されます。

---

## 19. 文書ファイルを1つずつ

### `AGENTS.md`

このプロジェクトで作業する開発者・AI向けの現行開発メモです。フォルダの分担、処理の流れ、実装済み仕様、整理候補、確認手順、未コミット変更を壊さない注意が書かれています。ゲーム実行時には読み込まれません。

### `clean-code-guide.md`

初心者向けのコーディング学習文書です。命名、書式、1関数1役割、早期return、重複削減、定数、コメント、HTML/CSS分担、エラー対策、チェックリストを説明します。ゲーム実行時には読み込まれません。

### `流れ.md`

初期の実装順、やりたいこと、スネークケースからキャメルケースへ変換する理由を記した短いメモです。`fileChange.js` など旧ファイル名が残っているため、現在の正確な構成は `AGENTS.md` とこのガイドを優先します。

### `project-complete-guide.md`

この文書です。現在の全ファイル、全クラス・全メソッド、引数の流れ、既存APIをまとめています。ゲーム実行時には読み込まれません。

---

## 20. JavaScriptのよく使う機能・用語集

### 変数：`const`

```js
const screen = new Screen();
```

同じ変数名へ別の値を再代入しない宣言です。オブジェクト内部のプロパティ変更はできます。

### クラスとインスタンス

```js
class Character {}
const player = new Character(...);
```

- class：設計図
- instance：設計図から作った実物
- constructor：`new` のとき自動実行される初期化メソッド

### `this`

メソッドを呼び出したインスタンス自身です。`player.takeDamage(10)` のメソッド内の `this` はplayerです。

### `static`

インスタンスではなくクラス名から呼ぶメソッドです。

```js
EnemyFactory.createRandomEnemy(...)
```

### `import` / `export`

別ファイルで定義した値やクラスを共有します。ブラウザでは `<script type="module">` が必要です。

### オブジェクト

```js
const result = {
  success: true,
  message: "成功",
};
```

名前と値の組をまとめます。`result.success` のように取得します。

### 分割代入

```js
const { action, skillIndex } = input;
```

オブジェクトから必要なプロパティを取り出します。

### 配列

```js
const skills = [];
skills.push(skill);
const first = skills[0];
```

複数の値を順番付きで持ちます。番号は0から始まります。

### `map()`

配列の各要素を別の値へ変換した新しい配列を返します。Screenでは各キャラクターやスキルをHTML文字列へ変換します。

### `filter()`

条件に合う要素だけの新しい配列を返します。敵候補や使用可能スキルを作ります。

### `some()`

条件に合う要素が1個でもあればtrueです。同名スキル確認に使います。

### `push()`

配列の末尾へ要素を追加します。

### `join()`

配列の要素を指定文字でつないで1文字列にします。

```js
messages.join("\n")
```

### スプレッド構文 `...`

```js
skills: [...this.skills]
```

配列の要素を展開して新しい配列へ入れます。

### アロー関数

```js
(input) => {
  this.handleAction(input);
}
```

短い関数表現です。外側の `this` を維持する性質があり、Gameのコールバックで重要です。

### コールバック

今すぐ実行せず、あとで呼んでもらうために渡す関数です。InputControllerへGameの処理を渡しておき、クリック時に呼んでもらいます。

### `async` / `await`

時間のかかる非同期処理を順番に読みやすく書きます。

- `async`：その関数がPromiseを返す
- `await`：Promiseの完了を待ち、結果を受け取る

### `fetch()`

ブラウザがHTTPでファイルやAPIを取得する既存関数です。このゲームでは `character.json` を読みます。

### `Response`

`fetch()` の戻り値です。

- `response.ok`：HTTP取得が成功範囲か
- `response.json()`：本文をJSONとして解析

### `throw new Error()`

処理を続けられない問題をエラーとして投げます。現在はデータ取得失敗と敵候補0件で使います。

### テンプレートリテラル

バッククォートで囲み、`${...}` で値を埋め込む文字列です。

```js
`${player.name}のHPは${player.hp}`
```

複数行HTMLにも使えます。

### `Number()`

文字列を数値へ変換します。`dataset` の配列番号を変換するときに使います。

### `Math.max()` / `Math.min()`

- `Math.max(a, b)`：大きい方
- `Math.min(a, b)`：小さい方

最低ダメージ、HP・MPの上下限で使います。

### `Math.floor()`

小数点以下を切り捨てます。ランダムな整数や50%回復量に使います。

### `Math.random()`

0以上1未満のランダムな小数です。敵と敵行動の抽選に使います。

### 比較演算子

| 演算子 | 意味 |
| --- | --- |
| `===` | 型も値も等しい |
| `!==` | 型または値が違う |
| `<` | 左が小さい |
| `>` | 左が大きい |
| `<=` | 左が小さいか等しい |

### `!`

真偽値を反転します。`!skill` はskillが `undefined`、`null` など「値なし扱い」ならtrueです。`!player.isAlive()` は生存していないという意味です。

### `null` と `undefined`

- `null`：開発者が意図的に「値なし」を入れたもの
- `undefined`：プロパティや配列要素などが存在しないときに出やすい値

### `??`

左が `null` または `undefined` のときだけ右を使います。

### `return`

- 値付き：呼び出し元へ結果を返して終了
- 値なし：その関数をすぐ終了

### DOM

ブラウザがHTMLをJavaScriptから操作できるオブジェクトの木構造にしたものです。

### `document.getElementById()`

DOMからIDが一致する要素を1個取得します。

### `textContent`

要素の文字内容を取得・変更します。HTMLタグとして解釈しません。

### `innerHTML`

要素内のHTMLを文字列で取得・置換します。動的ボタン作成に使います。

### `classList`

DOM要素のclassを操作します。

```js
document.body.classList.add("battle-screen");
document.body.classList.remove("title-screen");
```

### `src` と `alt`

img要素のプロパティです。

- `src`：画像ファイルの場所
- `alt`：画像を表示できないときや読み上げ時の代替文

### `addEventListener()`

クリックなどのイベントが起きたときの処理を登録します。

### `event.target`

イベントが実際に発生した要素です。

### `closest()`

自分から親方向へ、指定セレクターに一致する最初の要素を探します。

### `dataset`

`data-*` 属性を取得するためのプロパティです。ハイフン区切りがキャメルケースになります。

---

## 21. 現在のコードを理解するときに知っておく注意点

これは修正内容ではなく、現在の動作を正確に読むための注意です。

1. `CharacterLorder` は `Loader` の綴りではありませんが、参照名が統一されているので動作します。
2. `handleBattleAfterPlayerAction()` に同じ敵敗北条件が2回あり、2回目は到達しません。
3. `handleVictory(playerMessage)` と値を渡す場所がありますが、メソッドは引数を受け取らないので無視します。
4. 相打ちは `getBattleResult()` の判定順によりプレイヤー敗北です。
5. 魔法使いの `Mana Drain` は同名で2件あります。
6. `Skill.description` は保存されますが画面表示されません。
7. スキル習得失敗メッセージはRewardSystemから返りますが、Gameが画面へ渡していません。
8. 通常攻撃の戻り値 `damage` は現在Gameで使われません。
9. `assassin-original.png` はバックアップであり、現行コードから参照されません。
10. Git上で削除扱いの旧 `script.js`、`src/data/character.js`、`src/data/fileChange.js`、`images/suraimu.png` は現在のファイル関係には含まれません。勝手に復元しない前提です。

---

## 22. 実行と確認方法

`fetch()` を使うため、プロジェクト直下をローカルHTTPサーバーで公開してブラウザから開きます。

例：

```powershell
python -m http.server 8000
```

その後 `http://localhost:8000/` を開きます。

JavaScript構文だけを確認する例：

```powershell
node --check src/core/Game.js
node --check src/ui/Screen.js
```

ブラウザでは次を順番に確認すると、全ファイルのつながりを体験できます。

1. タイトルが出る
2. 「始める」でキャラクター選択へ進む
3. キャラクターを選ぶと敵が出る
4. 通常攻撃でHPが減る
5. スキル成功で複数の効果とメッセージが出る
6. MP不足では敵ターンへ進まない
7. 勝利後に報酬を選べる
8. 次の敵が連勝数に応じたレベルで出る
9. 敗北後は「タイトルへ戻る」だけになる
10. 開発者ツールのConsoleにエラーがない

---

## 23. 最後に：このゲームを1文で説明する

`index.html` が用意した入れ物に対し、`main.js` がJSON・モデル・システム・UIを組み立て、`InputController` が受けた操作を `Game` が判断し、`BattleSystem`・`RewardSystem`・`EnemyFactory` が状態を変更し、`Screen` がその最新状態をDOMへ描画し、`style.css` と `images/` が画面ごとの見た目を与えるゲームです。
