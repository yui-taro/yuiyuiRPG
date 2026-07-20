import { GamePhase } from "../constants/GamePhase.js";
import { EnemyFactory } from "../systems/EnemyFactory.js";

export class Game {
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

    this.phase = GamePhase.TITLE;
    this.player = null;
    this.enemy = null;
    this.winStreak = 0;
  }

  start() {
    this.inputController.setButtonClickHandler((input) => {
      this.handleAction(input);
    });

    this.screen.renderTitle();
  }

  handleAction(input) {
    const {
      action,
      characterIndex,
      skillIndex,
    } = input;

    if (action === "start-game") {
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
    this.handleSkillReward(skillIndex);
  }

  }

  showPlayerSelect() {
    this.phase = GamePhase.PLAYER_SELECT;

    this.screen.leaveTitle();
    this.screen.renderPlayerSelect(this.characters);
  }

  selectPlayer(characterIndex) {
    const index = Number(characterIndex);
    const selectedCharacter = this.characters[index];

    if (!selectedCharacter) {
      return;
    }

    this.player = selectedCharacter.clone();

    this.enemy = EnemyFactory.createRandomEnemy(
      this.characters,
      this.player,
      this.winStreak,
    );

    this.phase = GamePhase.BATTLE;

    this.screen.renderBattle(
      this.player,
      this.enemy,
      `${this.enemy.name}が現れた！`,
    );
  }

  handleNormalAttack() {
  if (this.phase !== GamePhase.BATTLE) {
    return;
  }

  const playerResult =
    this.battleSystem.normalAttack(
      this.player,
      this.enemy,
    );

  const resultAfterPlayerAttack =
    this.battleSystem.getBattleResult(
      this.player,
      this.enemy,
    );

  if (resultAfterPlayerAttack === "enemyDefeated") {
    this.handleVictory(playerResult.message);
    return;
  }

  const enemyResult =
    this.battleSystem.executeEnemyTurn(
      this.enemy,
      this.player,
    );

  const resultAfterEnemyAttack =
    this.battleSystem.getBattleResult(
      this.player,
      this.enemy,
    );

  if (resultAfterEnemyAttack === "playerDefeated") {
    this.handleGameOver(
      playerResult.message,
      enemyResult.message,
    );

    return;
  }

  this.screen.renderBattle(
    this.player,
    this.enemy,
    `${playerResult.message}\n\n${enemyResult.message}`,
  );
}

  handleSkill(skillIndex) {
  if (this.phase !== GamePhase.BATTLE) {
    return;
  }

  // Number()は、文字列を数値へ変換する既存機能
  const index = Number(skillIndex);
  const selectedSkill = this.player.skills[index];

  const playerResult =
    this.battleSystem.useSkill(
      this.player,
      this.enemy,
      selectedSkill,
    );

  // MP不足などでスキル使用に失敗した場合
  if (!playerResult.success) {
    this.screen.renderBattle(
      this.player,
      this.enemy,
      playerResult.message,
    );

    return;
  }

  const resultAfterPlayerAction =
    this.battleSystem.getBattleResult(
      this.player,
      this.enemy,
    );

  if (resultAfterPlayerAction === "enemyDefeated") {
    this.handleVictory(playerResult.message);
    return;
  }

  const enemyResult =
    this.battleSystem.executeEnemyTurn(
      this.enemy,
      this.player,
    );

  const resultAfterEnemyAction =
    this.battleSystem.getBattleResult(
      this.player,
      this.enemy,
    );

  if (resultAfterEnemyAction === "playerDefeated") {
    this.handleGameOver(
      playerResult.message,
      enemyResult.message,
    );

    return;
  }

  this.screen.renderBattle(
    this.player,
    this.enemy,
    `${playerResult.message}\n\n${enemyResult.message}`,
  );
}

  handleVictory(battleMessage) {
  this.phase = GamePhase.REWARD;
  this.winStreak += 1;

  this.screen.renderReward(
    this.player,
    this.enemy,
    this.winStreak,
  );
}

handleGameOver(playerMessage, enemyMessage) {
  this.phase = GamePhase.GAME_OVER;

  this.screen.renderBattle(
    this.player,
    this.enemy,
    `${playerMessage}\n\n${enemyMessage}\n\nあなたの敗北……`,
  );
}

handleLevelUpReward() {
  if (this.phase !== GamePhase.REWARD) {
    return;
  }

  const message =
    this.rewardSystem.applyLevelUp(
      this.player,
    );

  this.startNextBattle(message);
}

handleHpReward() {
  if (this.phase !== GamePhase.REWARD) {
    return;
  }

  const message =
    this.rewardSystem.applyHpRecovery(
      this.player,
    );

  this.startNextBattle(message);
}

handleMpReward() {
  if (this.phase !== GamePhase.REWARD) {
    return;
  }

  const message =
    this.rewardSystem.applyMpRecovery(
      this.player,
    );

  this.startNextBattle(message);
}

showSkillReward() {
  if (this.phase !== GamePhase.REWARD) {
    return;
  }

  this.screen.renderSkillReward(this.enemy);
}

handleSkillReward(skillIndex) {
  if (this.phase !== GamePhase.REWARD) {
    return;
  }

  const result =
    this.rewardSystem.applyStealSkill(
      this.player,
      this.enemy,
      skillIndex,
    );

  if (!result.success) {
    this.screen.renderSkillReward(this.enemy);
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
  );
}
}