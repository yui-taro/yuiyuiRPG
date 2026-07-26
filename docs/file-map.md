# yuiyuiRPG ファイル関係図

この図は、現在のプロジェクトに存在するソースコード、データ、画像、開発文書の関係を表します。

## 実行時の流れ

```mermaid
flowchart TD
    Browser["ブラウザ"]
    HTML["index.html<br/>固定DOMの土台"]
    CSS["style.css<br/>画面ごとの見た目"]
    Main["src/main.js<br/>全部品を組み立てて起動"]
    JSON["character.json<br/>6キャラクター・24スキル"]
    Loader["src/data/CharacterLorder.js<br/>JSONをゲーム用オブジェクトへ変換"]
    Character["src/models/Character.js<br/>キャラクターの状態と基本動作"]
    Skill["src/models/Skill.js<br/>スキル効果値"]
    Game["src/core/Game.js<br/>ゲーム進行の司令塔"]
    Phase["src/constants/GamePhase.js<br/>操作可能な場面の定数"]
    Input["src/ui/InputController.js<br/>クリックをinputへ変換"]
    Screen["src/ui/Screen.js<br/>DOMを描画"]
    Battle["src/systems/BattleSystem.js<br/>戦闘ルール"]
    Enemy["src/systems/EnemyFactory.js<br/>敵抽選とレベル補正"]
    Reward["src/systems/RewardSystem.js<br/>勝利報酬"]
    DOM["HTMLの固定DOM<br/>game-info / status / image / message / button"]

    Browser --> HTML
    HTML -->|link| CSS
    HTML -->|script type=module| Main
    Main -->|loadCharacters| Loader
    Loader -->|fetch| JSON
    Loader -->|new| Character
    Loader -->|new| Skill
    Main -->|new Game| Game
    Main --> Input
    Main --> Screen
    Main --> Battle
    Main --> Reward
    Game --> Phase
    Game -->|入力を受ける| Input
    Game -->|renderを呼ぶ| Screen
    Game -->|攻撃・スキル・勝敗| Battle
    Game -->|次の敵を作る| Enemy
    Game -->|報酬を適用| Reward
    Battle -->|HP・MP・能力を変更| Character
    Enemy -->|clone・能力補正| Character
    Reward -->|成長・回復・スキル追加| Character
    Screen -->|getElementById・innerHTML・textContent| DOM
    DOM -->|clickのイベント委譲| Input
    Screen -->|bodyの画面クラス| CSS
```

## ボタンを押してから画面が更新されるまで

```mermaid
sequenceDiagram
    participant S as Screen.js
    participant H as index.html
    participant U as ユーザー
    participant I as InputController.js
    participant G as Game.js
    participant B as BattleSystem.js
    participant C as Character.js

    S->>H: data-action付きbuttonをinnerHTMLで作成
    U->>H: ボタンをクリック
    H->>I: clickイベント
    I->>I: closest("button")とdatasetを取得
    I->>G: handleAction(input)
    G->>B: normalAttackまたはuseSkill
    B->>C: takeDamage・healHp・useMpなど
    C-->>B: 更新後の状態
    B-->>G: success・message
    G->>B: getBattleResult
    B-->>G: continue・enemyDefeated・playerDefeated
    G->>S: renderBattle・renderReward・renderGameOver
    S->>H: DOMの文字・画像・ボタンを更新
```

## 画像ファイル

```mermaid
flowchart LR
    CSS["style.css"]
    Loader["CharacterLorder.js"]
    Screen["Screen.js"]

    Title["images/title-background.png<br/>タイトル背景"]
    Fight["images/fight-background.png<br/>選択・戦闘・報酬背景"]
    Warrior["images/warrior.png<br/>戦士"]
    Mage["images/mage.png<br/>魔法使い"]
    Paladin["images/paladin.png<br/>聖騎士"]
    Assassin["images/assassin.png<br/>暗殺者"]
    AssassinOriginal["images/assassin-original.png<br/>元向きバックアップ"]
    Golem["images/rock-golem.png<br/>岩ゴーレム"]
    Vampire["images/vampire-rode.png<br/>吸血鬼の王"]

    CSS --> Title
    CSS --> Fight
    Loader --> Warrior
    Loader --> Mage
    Loader --> Paladin
    Loader --> Assassin
    Loader --> Golem
    Loader --> Vampire
    Loader -->|imageパスをCharacterへ保存| Screen
    AssassinOriginal -.->|バックアップ・実行時未参照| Assassin
```

## 学習・開発用文書

```mermaid
flowchart LR
    Agents["AGENTS.md<br/>現行仕様・開発ルール・確認手順"]
    Clean["clean-code-guide.md<br/>読みやすいコードの学習ガイド"]
    Flow["流れ.md<br/>初期実装順とTODOメモ"]
    Complete["project-complete-guide.md<br/>全ファイル・全関数・既存機能の詳細"]
    Map["docs/file-map.md<br/>この関係図"]

    Agents --> Complete
    Clean --> Complete
    Flow --> Complete
    Complete --> Map
```

詳しい引数の出どころ、全メソッドの呼び出し元、`getElementById()`、`dataset`、`fetch()` などの説明は、ルートにある [`project-complete-guide.md`](../project-complete-guide.md) を参照してください。
