# RPG制作で目指す「きれいなコード」

## はじめに

「きれいなコード」とは、単に短いコードや、難しい書き方を使ったコードではありません。

> **あとから自分や他の人が読んだときに、何をしているか理解しやすく、安全に変更できるコード**

これが一番大切な考え方です。

完成直後に動くだけでなく、1か月後に「敵の種類を増やしたい」「回復スキルを追加したい」と思ったとき、変更する場所が分かりやすいコードを目指します。

ITを始めて3か月の時点では、すべてを完璧に設計する必要はありません。まずは次の5項目を守れれば十分です。

1. 名前から役割が分かる
2. 同じ書き方にそろえる
3. 1つの関数に仕事を詰め込みすぎない
4. 同じコードを何度も書かない
5. HTML・CSS・JavaScriptの役割を分ける

---

## このプロジェクトですでにできていること

現在のプロジェクトは、ファイルを次のような役割に分けています。

- `models`：キャラクターやスキルなどのデータと振る舞い
- `systems`：戦闘、報酬、敵生成などのゲームルール
- `ui`：画面表示と入力
- `core`：ゲーム全体の進行
- `constants`：共通で使う固定値
- `data`：ゲームデータの読み込み

これは良い方向です。例えば、ダメージ計算を変更するときは `BattleSystem.js`、表示を変更するときは `Screen.js` を確認すればよい、と予想できます。

きれいなコードでは、このように**「どこを読めばよいか予想できること」**も重要です。

---

## 1. 名前から役割が分かるようにする

変数名や関数名は、短さより意味の分かりやすさを優先します。

### 分かりにくい例

```js
const x = characters[i];

function doIt(a, b) {
  return a - b;
}
```

`x`、`doIt`、`a`、`b`だけでは、何を表すのか読み手が推測しなければなりません。

### 分かりやすい例

```js
const selectedCharacter = characters[characterIndex];

function calculateDamage(attack, defense) {
  return Math.max(1, attack - defense);
}
```

### 初心者向けの命名ルール

- 変数は「何が入っているか」を表す：`player`、`selectedSkill`
- 関数は「何をするか」を動詞で表す：`startBattle()`、`healPlayer()`
- 真偽値は質問のようにする：`isAlive`、`canUseSkill`
- 配列は複数形にする：`characters`、`skills`
- 意味が同じものには同じ単語を使う

`enemy` と `monster` のように、同じ意味の言葉を場所によって変えると混乱しやすくなります。このゲームで「敵」を `enemy` と呼ぶと決めたら、できるだけ統一します。

`i` は短い繰り返し処理の添字、`x` と `y` は座標など、意味が明らかな場合には使っても構いません。

---

## 2. 書き方をそろえる

同じプロジェクト内で字下げ、空白、セミコロン、改行のルールがそろっていると、内容に集中して読めます。

### そろっていない例

```js
normalAttack(attacker,defender){
    const damage = Math.max(1, attacker.atk - defender.def,);
  defender.takeDamage(damage)
}
```

### そろえた例

```js
normalAttack(attacker, defender) {
  const damage = Math.max(1, attacker.atk - defender.def);
  defender.takeDamage(damage);
}
```

最初は次のルールで十分です。

- 字下げは半角スペース2個
- `{` の前に半角スペースを入れる
- `,` の後に半角スペースを入れる
- 文の終わりにセミコロンを付ける
- 長すぎない処理は、むやみに途中で改行しない
- HTML属性の `=` の前後に空白を入れない

```html
<!-- 推奨 -->
<section class="status-area">
  <div id="player-status" class="status-card"></div>
</section>
```

ルールの内容以上に、**プロジェクト全体で統一されていること**が大切です。

---

## 3. 1つの関数には1つの役割を持たせる

関数名を見たとき、その関数がする仕事を短い一文で説明できる大きさを目指します。

### 仕事が多すぎる例

```js
function attack() {
  // ダメージを計算する
  // HPを減らす
  // 勝敗を判定する
  // 敵の行動を決める
  // 画面を更新する
  // 報酬画面を表示する
}
```

### 役割を分けた例

```js
function calculateDamage(attacker, defender) {
  return Math.max(1, attacker.atk - defender.def);
}

function applyDamage(character, damage) {
  character.takeDamage(damage);
}

function getBattleResult(player, enemy) {
  if (!player.isAlive()) return "playerDefeated";
  if (!enemy.isAlive()) return "enemyDefeated";

  return "continue";
}
```

ただし、細かく分けすぎる必要もありません。次のどれかに当てはまったときに分割を考えます。

- 関数が長くなり、画面に収まらなくなった
- 関数名と関係のない処理が混ざった
- 同じ処理を別の場所でも使いたくなった
- コメントで処理を何段階にも説明している

行数だけで良し悪しは決まりません。最初の目安として、1つの関数が30～40行を大きく超えたら分けられないか考えます。

---

## 4. 条件分岐を読みやすくする

条件の入れ子が深くなると、処理を追いにくくなります。先に「何もしない場合」を `return` すると読みやすくなります。この書き方は早期リターンと呼ばれます。

### 入れ子が深い例

```js
function useSkill(skill) {
  if (phase === GamePhase.BATTLE) {
    if (skill) {
      if (player.mp >= skill.costMp) {
        // スキルを使う処理
      }
    }
  }
}
```

### 早期リターンを使った例

```js
function useSkill(skill) {
  if (phase !== GamePhase.BATTLE) {
    return;
  }

  if (!skill) {
    return;
  }

  if (player.mp < skill.costMp) {
    return;
  }

  // スキルを使う処理
}
```

上から順に条件を確認でき、中心となる処理の字下げも深くなりません。

---

## 5. 同じ処理を何度も書かない

同じ処理が2～3か所に現れ、今後も一緒に変更しそうなら関数にまとめます。

### 重複している例

```js
player.hp += 20;
player.hp = Math.min(player.hp, player.maxHp);

enemy.hp += 20;
enemy.hp = Math.min(enemy.hp, enemy.maxHp);
```

### 関数にまとめた例

```js
function heal(character, amount) {
  character.hp += amount;
  character.hp = Math.min(character.hp, character.maxHp);
}

heal(player, 20);
heal(enemy, 20);
```

ただし、見た目が少し似ているだけのコードを、無理に1つにまとめる必要はありません。共通化によって名前や引数が複雑になるなら、重複したままの方が読みやすい場合もあります。

---

## 6. 数値や文字列の意味を明らかにする

理由の分からない数値が直接書かれていると、あとで変更しにくくなります。このような値はマジックナンバーと呼ばれます。

### 意味が分かりにくい例

```js
if (winStreak >= 10) {
  player.atk += 5;
}
```

### 名前を付けた例

```js
const BOSS_APPEAR_WIN_STREAK = 10;
const BOSS_REWARD_ATTACK = 5;

if (winStreak >= BOSS_APPEAR_WIN_STREAK) {
  player.atk += BOSS_REWARD_ATTACK;
}
```

すべての数値を定数にする必要はありません。`0` や `1` のように意味が明らかな値、CSSの細かな見た目の値などは、そのままでも構いません。

ゲームのバランスに関係する値は、まとまったデータとして管理すると調整しやすくなります。

```js
const battleSettings = {
  minimumDamage: 1,
  bossWinStreak: 10,
  criticalRate: 0.1,
};
```

---

## 7. コメントには「理由」を書く

コードをそのまま日本語にしたコメントは、なくても理解できることが多いです。

### なくても分かるコメント

```js
// 勝利数を1増やす
winStreak += 1;
```

### 理由を説明するコメント

```js
// ボタンのdata属性から受け取るため、文字列を数値に変換する
const skillIndex = Number(input.skillIndex);
```

良い名前で説明できるなら、まず名前を改善します。コメントは次のような内容に使います。

- なぜこの処理が必要なのか
- なぜ単純な方法を使わなかったのか
- 外部データやブラウザの仕様に関する注意
- 今後直したい内容と、その理由

処理を変更したのに古いコメントが残ると、コメントがない場合より危険です。コードを変更したら、近くのコメントも確認します。

---

## 8. HTMLを読みやすくする

HTMLでは、画面の構造と意味が分かることを大切にします。

```html
<main class="game">
  <h1 class="site-logo">yuiRPG</h1>

  <section class="status-area" aria-label="キャラクターの状態">
    <div id="player-status" class="status-card"></div>
    <div id="enemy-status" class="status-card"></div>
  </section>

  <section class="battle-area" aria-label="戦闘画面">
    <!-- キャラクター画像 -->
  </section>
</main>
```

確認するポイントは次のとおりです。

- 字下げで親子関係を表す
- 閉じタグの位置をそろえる
- `button`、`main`、`section` など、目的に合うタグを使う
- 画像の `alt` に画像の意味を書く
- 同じページで同じ `id` を2回使わない
- JavaScript用の情報は `data-*` 属性に置く

```html
<button type="button" data-action="normal-attack">
  通常攻撃
</button>
```

---

## 9. CSSを読みやすくする

CSSは、似た役割のルールを近くに置き、具体的すぎるセレクターを増やしすぎないようにします。

```css
/* 共通ボタン */
.game-action-button {
  padding: 12px 18px;
  color: #fff4cf;
  background-color: #21132f;
}

.game-action-button:hover {
  filter: brightness(1.2);
}

/* 戦闘画面 */
.battle-screen .status-area {
  display: flex;
  gap: 24px;
}
```

最初は次の順序でCSSを並べると探しやすくなります。

1. 全画面共通
2. タイトル画面
3. キャラクター選択画面
4. 戦闘画面
5. 報酬画面
6. スマートフォン表示用のメディアクエリ

色や余白を何度も使う場合は、CSSカスタムプロパティにまとめられます。

```css
:root {
  --color-panel: #111122;
  --color-accent: #d6ad55;
  --space-medium: 16px;
}

.status-card {
  padding: var(--space-medium);
  border-color: var(--color-accent);
  background-color: var(--color-panel);
}
```

最初からすべてを変数にせず、何度も使い、まとめる価値がある色や余白だけで十分です。

---

## 10. HTML・CSS・JavaScriptの役割を分ける

基本的な役割は次のように考えます。

| 種類 | 主な役割 |
|---|---|
| HTML | 画面の構造と内容 |
| CSS | 色、配置、大きさなどの見た目 |
| JavaScript | 入力、計算、状態の変化、画面の更新 |

例えば、JavaScriptでボタンへ大量の見た目を直接設定するより、クラスを付け替えてCSSに任せます。

```js
document.body.classList.add("battle-screen");
document.body.classList.remove("title-screen");
```

```css
.title-screen .battle-area {
  display: none;
}

.battle-screen .battle-area {
  display: flex;
}
```

ただし、キャラクター名や現在のHPのようにゲーム中に変化する内容は、JavaScriptで更新して問題ありません。

---

## 11. エラーになりそうな入力を確認する

きれいなコードは、正常な場合だけでなく、想定外の値が来た場合も考えます。

```js
function selectPlayer(characterIndex) {
  const index = Number(characterIndex);
  const selectedCharacter = characters[index];

  if (!selectedCharacter) {
    console.error("選択されたキャラクターが見つかりません");
    return;
  }

  player = selectedCharacter.clone();
}
```

このゲームで特に確認したいものは次のとおりです。

- 選択したキャラクターやスキルが存在するか
- MPが足りるか
- HPやMPが最大値を超えたり、0未満になったりしないか
- JSONの読み込みに失敗していないか
- 戦闘中以外に攻撃処理が呼ばれていないか

---

## 12. 一度に直しすぎない

コードをきれいにする変更は、リファクタリングと呼ばれます。リファクタリングでは、**動作を変えずにコードの構造を改善すること**が基本です。

安全に進める手順は次のとおりです。

1. 変更前にゲームを動かす
2. 直す目的を1つ決める
3. 小さな範囲だけ変更する
4. もう一度ゲームを動かす
5. 正常なら次の変更へ進む

例えば「今日は `BattleSystem.js` の字下げだけ」「次に変数名だけ」のように分けます。字下げ、命名、機能追加を同時に行うと、エラーの原因を探しにくくなります。

---

## 今の段階では無理にしなくてよいこと

次の項目は役立つこともありますが、ITを始めて3か月の段階で最優先ではありません。

- 難しいデザインパターンを覚えて使う
- すべてをクラスにする
- 1行でも重複したら必ず共通化する
- 関数を極端に細かく分ける
- 高度なビルドツールをたくさん導入する
- 最初から完璧なフォルダ構成を設計する
- コードの行数を少なくすることだけを目標にする

難しい書き方より、自分が説明できる書き方を選びます。

---

## このRPGでの改善優先順位

### 優先度1：今すぐ意識する

- 字下げと空白をファイル全体でそろえる
- 変数・関数に意味の分かる名前を付ける
- HTMLタグの親子関係を字下げで表す
- 文字コードをUTF-8に統一し、日本語が文字化けしないようにする
- 変更後にタイトル、キャラクター選択、戦闘、報酬を一通り操作する

### 優先度2：慣れてから行う

- 長い関数を役割ごとに分ける
- 重複する戦闘処理を関数にまとめる
- ゲームバランスの数値に名前を付ける
- CSSのよく使う色をカスタムプロパティにする
- ブラウザの開発者ツールでエラーを確認する

### 優先度3：さらに余裕ができたら行う

- ESLintでJavaScriptの問題を検出する
- Prettierで書式を自動的にそろえる
- ダメージ計算など、重要な処理のテストを書く
- 1回の変更を小さくしてGitに記録する

---

## 完成前の簡単チェックリスト

### JavaScript

- [ ] 変数名から中身を想像できる
- [ ] 関数名から処理を想像できる
- [ ] `const` を基本とし、再代入が必要な場合だけ `let` を使っている
- [ ] 字下げと空白がそろっている
- [ ] 深い入れ子を早期リターンで減らしている
- [ ] 同じ処理を何度もコピーしていない
- [ ] 意味の分からない数値が大量に直接書かれていない
- [ ] ブラウザのコンソールにエラーが出ていない

### HTML

- [ ] タグが正しく閉じられている
- [ ] 親子関係に合わせて字下げされている
- [ ] `id` が重複していない
- [ ] 画像に適切な `alt` がある
- [ ] ボタンに `type="button"` がある

### CSS

- [ ] 同じ画面や部品のスタイルが近くにまとまっている
- [ ] クラス名から対象を想像できる
- [ ] 同じ指定を必要以上に繰り返していない
- [ ] パソコン表示とスマートフォン表示を確認した

### 動作確認

- [ ] ゲーム開始ができる
- [ ] キャラクターを選択できる
- [ ] 通常攻撃とスキルを使える
- [ ] MP不足の場合も正しく動く
- [ ] 勝利後に報酬を選べる
- [ ] 敗北時の画面が正しく表示される

---

## まとめ

最初に目指す「きれいなコード」は、次の一文にまとめられます。

> **名前と配置から処理を予想でき、少しずつ安全に変更できるコード**

コードを書くときは、毎回すべてのルールを思い出す必要はありません。まず次の3つだけ確認してください。

1. この名前で役割が伝わるか
2. この関数は仕事を持ちすぎていないか
3. 変更後にゲームを実際に操作したか

昨日の自分が書いたコードを、今日の自分が少し読みやすくできれば十分な成長です。
