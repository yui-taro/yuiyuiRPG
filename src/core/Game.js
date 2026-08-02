//ボタン入力を受け取る→ 現在のゲーム状態を確認する→ 戦闘や報酬処理を呼び出す→ Screenに画面表示を依頼する
import { GamePhase } from "../constants/GamePhase.js";
import { EnemyFactory } from "../systems/EnemyFactory.js";

//export:ほかのクラスからも使えるようになる
export class Game {
  //mainで初期設定します
  constructor({
    characters,
    screen,
    inputController,
    battleSystem,
    rewardSystem,
  }) {
    this.characters = characters;
    this.screen = screen;
    this.inputController = inputController;
    this.battleSystem = battleSystem;
    this.rewardSystem = rewardSystem;

    //現在のフェーズをtitle画面に設定
    this.phase = GamePhase.TITLE;
    //最初の段階ではプレイヤーと敵は設定なし
    this.player = null;
    this.enemy = null;
    //連勝数ゼロ
    this.winStreak = 0;
  }

  //mainから呼び出されスタートする
  start() {
    //inputには押されたボタンの情報が入る
    this.inputController.setButtonClickHandler((input) => {
      //受け取ったボタン情報をhandleAction()へ渡す
      //★次のメソッドに移動
      this.handleAction(input);
    });
    //★screenクラスに行き、タイトル画面表示のメソッド発動
    this.screen.renderTitle();
  }

  //ボタンが押されたときに呼ばれるメソッド
  handleAction(input) {
    //inputの中から三つ取り出してそれぞれ変数にいれる
    const { action, characterIndex, skillIndex } = input;

    //押されたボタンの種類がstart-gameか確認
    if (action === "start-game") {
      //★同じクラスのメソッドに移動
      this.showPlayerSelect();
      return;
    }

    if (action === "select-player") {
      this.selectPlayer(characterIndex);
      return;
    }

    if (action === "normal-attack") {
      this.handleNormalAttack();
      return;
    }

    if (action === "use-skill") {
      this.handleSkill(skillIndex);
      return;
    }

    if (action === "reward-level-up") {
      this.handleLevelUpReward();
      return;
    }

    if (action === "reward-heal-hp") {
      this.handleHpReward();
      return;
    }

    if (action === "reward-heal-mp") {
      this.handleMpReward();
      return;
    }

    if (action === "reward-steal-skill") {
      this.showSkillReward();
      return;
    }

    if (action === "select-reward-skill") {
      //奪ったスキルを引数とする
      this.handleSkillReward(skillIndex);
      return;
    }

    if (action === "back-to-reward") {
      this.showReward();
      return;
    }

    if (action === "restart-game") {
      this.restartGame();
      return;
    }
  }

  //handleActionから呼ばれる
  //キャラクター選択画面を表示するメソッド
  showPlayerSelect() {
    //フェーズをキャラクター選択中に変更
    this.phase = GamePhase.PLAYER_SELECT;
    //  ★screenに移動し、キャラクター選択画面を表示させる
    this.screen.renderPlayerSelect(this.characters);
  }

  selectPlayer(characterIndex) {
    //htmlからは文字列で受け取るので、既存のメソッドで数字に変換する
    const index = Number(characterIndex);
    //場所からキャラを特定
    const selectedCharacter = this.characters[index];
    //存在しなければ、処理終了
    if (!selectedCharacter) {
      return;
    }

    //クローンメソッドでコピーを生成
    this.player = selectedCharacter.clone();

    //★EnemyFactoryに移動しランダム敵生成
    this.enemy = EnemyFactory.createRandomEnemy(
      this.characters,
      this.player,
      this.winStreak,
    );

    //ゲーム状態を戦闘中に変更
    this.phase = GamePhase.BATTLE;
    //★screenに移動し、バトル画面表示
    this.screen.renderBattle(
      this.player,
      this.enemy,
      //変数の値を文章の中に埋め込むテンプレートリテラル使用。+使うのと変わりない
      `${this.enemy.name}が現れた！`,
      this.winStreak,
    );
  }

  handleNormalAttack() {
    //戦闘中でなければ処理をやめる
    if (this.phase !== GamePhase.BATTLE) {
      return;
    }

    //通常攻撃の結果をplayerResultに保存
    const playerResult = this.battleSystem.normalAttack(
      this.player,
      this.enemy,
    );

    //結果のメッセージを引数に、プレイヤーの行動後に共通して行う処理を呼び出し
    this.handleBattleAfterPlayerAction(playerResult.message);
  }

  handleSkill(skillIndex) {
    if (this.phase !== GamePhase.BATTLE) {
      return;
    }

    const index = Number(skillIndex);
    const selectedSkill = this.player.skills[index];

    const playerResult = this.battleSystem.useSkill(
      this.player,
      this.enemy,
      selectedSkill,
    );

    //mp不足などスキル使用失敗したら、バトル画面にメッセージを渡す
    if (!playerResult.success) {
      this.screen.renderBattle(
        this.player,
        this.enemy,
        playerResult.message,
        this.winStreak,
      );
      return;
    }

    this.handleBattleAfterPlayerAction(playerResult.message);
  }

  //プレイヤーの行動直後に、勝敗を確認
  //★battleSystemに移動
  handleBattleAfterPlayerAction(playerMessage) {
    const resultAfterPlayerAction = this.battleSystem.getBattleResult(
      this.player,
      this.enemy,
    );

    //敵が倒れていたら、勝利処理を実行して終了
    if (resultAfterPlayerAction === "enemyDefeated") {
      this.handleVictory();
      return;
    }

    //プレイヤーが倒れていたら、ゲームオーバー処理を実行
    if (resultAfterPlayerAction === "playerDefeated") {
      this.handleGameOver(playerMessage, "");
      return;
    }

    //★battleSystemに移動　敵がプレイヤーを攻撃したり、スキルを使用
    const enemyResult = this.battleSystem.executeEnemyTurn(
      this.enemy,
      this.player,
    );

    //敵の行動後、もう一度勝敗を確認
    const resultAfterEnemyAction = this.battleSystem.getBattleResult(
      this.player,
      this.enemy,
    );

    //敵の攻撃でプレイヤーが倒れた場合、ゲームオーバー
    if (resultAfterEnemyAction === "playerDefeated") {
      this.handleGameOver(playerMessage, enemyResult.message);
      return;
    }

    if (resultAfterEnemyAction === "enemyDefeated") {
      this.handleVictory();
      return;
    }

    //どちらも倒れていなければ、戦闘画面を更新
    this.screen.renderBattle(
      this.player,
      this.enemy,
      `${playerMessage}\n${enemyResult.message}`,
      this.winStreak,
    );
  }

  handleVictory() {
    //ゲーム状態を報酬画面に変更
    this.phase = GamePhase.REWARD;
    //連勝数を1増やす
    this.winStreak += 1;

    //報酬画面の表示
    this.screen.renderReward(this.enemy, this.winStreak);
  }

  handleGameOver(playerMessage, enemyMessage) {
    //ゲーム状態をゲームオーバーに
    this.phase = GamePhase.GAME_OVER;

    //敗北時に表示する文章を作成
    const message = `${playerMessage}\n\n${enemyMessage}\n\nあなたは敗北した……`;

    //★screenに移動し、ゲームオーバー画面を表示
    this.screen.renderGameOver(
      this.player,
      this.enemy,
      message,
      this.winStreak,
    );
  }

  handleLevelUpReward() {
    //報酬画面でない場合は、報酬を受け取れないようにする
    if (this.phase !== GamePhase.REWARD) {
      return;
    }
    //プレイヤーにレベルアップ報酬を施し、結果として表示用メッセージを受け取る
    const message = this.rewardSystem.applyLevelUp(this.player);

    //次の戦闘開始
    this.startNextBattle(message);
  }

  handleHpReward() {
    if (this.phase !== GamePhase.REWARD) {
      return;
    }

    const message = this.rewardSystem.applyHpRecovery(this.player);

    this.startNextBattle(message);
  }

  handleMpReward() {
    if (this.phase !== GamePhase.REWARD) {
      return;
    }

    const message = this.rewardSystem.applyMpRecovery(this.player);

    this.startNextBattle(message);
  }

  showSkillReward() {
    if (this.phase !== GamePhase.REWARD) {
      return;
    }

    this.screen.renderSkillReward(this.enemy, this.player);
  }

  showReward() {
    if (this.phase !== GamePhase.REWARD) {
      return;
    }

    this.screen.renderReward(this.enemy, this.winStreak);
  }

  handleSkillReward(skillIndex) {
    if (this.phase !== GamePhase.REWARD) {
      return;
    }

    const result = this.rewardSystem.applyStealSkill(
      this.player,
      this.enemy,
      skillIndex,
    );

    if (!result.success) {
      this.screen.renderSkillReward(this.enemy, this.player, result.message);
      return;
    }

    this.startNextBattle(result.message);
  }

  startNextBattle(rewardMessage) {
    this.enemy = EnemyFactory.createRandomEnemy(
      this.characters,
      this.player,
      this.winStreak,
    );

    this.phase = GamePhase.BATTLE;

    this.screen.renderBattle(
      this.player,
      this.enemy,
      `${rewardMessage}\n\n` +
        `Lv.${this.enemy.level}の` +
        `${this.enemy.name}が現れた！`,
      this.winStreak,
    );
  }

  restartGame() {
    this.phase = GamePhase.TITLE;
    this.player = null;
    this.enemy = null;
    this.winStreak = 0;

    this.screen.renderTitle();
  }
}
