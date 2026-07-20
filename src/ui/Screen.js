export class Screen {
  constructor() {
    this.gameInfo = document.getElementById("game-info");
    this.playerStatus = document.getElementById("player-status");
    this.enemyStatus = document.getElementById("enemy-status");
    this.playerImage = document.getElementById("player-image");
    this.enemyImage = document.getElementById("enemy-image");
    this.messageArea = document.getElementById("message-area");
    this.buttonArea = document.getElementById("button-area");
  }

  renderTitle() {
    document.body.classList.add("title-screen");
    document.body.classList.remove("battle-screen");

    this.gameInfo.textContent = "";

    this.playerStatus.style.display = "none";
    this.enemyStatus.style.display = "none";

    this.playerImage.style.display = "none";
    this.enemyImage.style.display = "none";

    this.messageArea.innerHTML = `
      <div class="title-content">
        <h1 class="game-title">YUI RPG</h1>
        <p class="game-subtitle">冒険の世界へ</p>
      </div>
    `;

    this.buttonArea.innerHTML = `
      <button
        type="button"
        class="start-button"
        data-action="start-game"
      >
        始める
      </button>
    `;
  }

  leaveTitle() {
    document.body.classList.remove("title-screen");
  }

  renderPlayerSelect(characters) {
  document.body.classList.remove("title-screen");
  document.body.classList.remove("battle-screen");
  document.body.classList.add("player-select-screen");

  this.gameInfo.style.display = "none";
  this.playerStatus.style.display = "none";
  this.enemyStatus.style.display = "none";
  this.playerImage.style.display = "none";
  this.enemyImage.style.display = "none";

  this.messageArea.innerHTML = `
    <div class="select-heading">
      <p class="select-subtitle">CHOOSE YOUR HERO</p>
      <h2>冒険するキャラクターを選んでください</h2>
    </div>
  `;

  this.buttonArea.innerHTML = characters
    .map(
      (character, index) => `
        <button
          type="button"
          class="character-select-card"
          data-action="select-player"
          data-character-index="${index}"
        >
          <span class="character-name">
            ${character.name}
          </span>

          <span class="character-stats">
            HP ${character.maxHp}
            ／ MP ${character.maxMp}
          </span>

          <span class="character-stats">
            ATK ${character.atk}
            ／ DEF ${character.def}
          </span>
        </button>
      `,
    )
    .join("");
}

  renderBattle(player, enemy, message) {
    document.body.classList.remove(
  "reward-screen",
  "player-select-screen",
);
    document.body.classList.remove(
  "player-select-screen",
);
    document.body.classList.remove("title-screen");
    document.body.classList.add("battle-screen");

    this.gameInfo.style.display = "";
    this.gameInfo.textContent = "戦闘";

    this.playerStatus.style.display = "";
    this.enemyStatus.style.display = "";

    this.playerImage.style.display = "";
    this.enemyImage.style.display = "";

    this.playerStatus.innerHTML = `
      <h2>${player.name}</h2>
      <p>Lv.${player.level}</p>
      <p>HP：${player.hp} / ${player.maxHp}</p>
      <p>MP：${player.mp} / ${player.maxMp}</p>
      <p>ATK：${player.atk}</p>
      <p>DEF：${player.def}</p>
    `;

    this.enemyStatus.innerHTML = `
      <h2>${enemy.name}</h2>
      <p>Lv.${enemy.level}</p>
      <p>HP：${enemy.hp} / ${enemy.maxHp}</p>
      <p>MP：${enemy.mp} / ${enemy.maxMp}</p>
      <p>ATK：${enemy.atk}</p>
      <p>DEF：${enemy.def}</p>
    `;

    this.playerImage.src = player.image;
    this.playerImage.alt = player.name;

    this.enemyImage.src = enemy.image;
    this.enemyImage.alt = enemy.name;

    this.messageArea.textContent = message;

    this.buttonArea.innerHTML = `
      <button
        type="button"
        class="game-action-button"
        data-action="normal-attack"
      >
        通常攻撃
      </button>

      ${player.skills
        .map(
          (skill, index) => `
            <button
              type="button"
              class="game-action-button"
              data-action="use-skill"
              data-skill-index="${index}"
            >
              ${skill.name}
            </button>
          `,
        )
        .join("")}
    `;
  }

  leaveBattle() {
    document.body.classList.remove("battle-screen");
  }

  renderReward(player, enemy, winStreak) {
  document.body.classList.remove(
    "title-screen",
    "battle-screen",
    "player-select-screen",
  );

  document.body.classList.add("reward-screen");

  this.gameInfo.style.display = "none";

  this.playerStatus.style.display = "none";
  this.enemyStatus.style.display = "none";

  this.playerImage.style.display = "none";
  this.enemyImage.style.display = "none";

  this.messageArea.innerHTML = `
    <div class="reward-heading">
      <p class="reward-subtitle">
        VICTORY REWARD
      </p>

      <h2>戦利品を選んでください</h2>

      <p class="reward-description">
        ${enemy.name}を撃破しました
        ／ ${winStreak}連勝
      </p>
    </div>
  `;

  this.buttonArea.innerHTML = `
    <button
      type="button"
      class="reward-card"
      data-action="reward-level-up"
    >
      <span class="reward-name">
        レベルアップ
      </span>
      <span class="reward-detail">
        最大HP・MP・ATK・DEFを強化
      </span>
    </button>

    <button
      type="button"
      class="reward-card"
      data-action="reward-steal-skill"
    >
      <span class="reward-name">
        敵のスキルを奪う
      </span>
      <span class="reward-detail">
        倒した敵のスキルを1つ習得
      </span>
    </button>

    <button
      type="button"
      class="reward-card"
      data-action="reward-heal-hp"
    >
      <span class="reward-name">
        HPを50％回復
      </span>
      <span class="reward-detail">
        最大HPの半分を回復
      </span>
    </button>

    <button
      type="button"
      class="reward-card"
      data-action="reward-heal-mp"
    >
      <span class="reward-name">
        MPを50％回復
      </span>
      <span class="reward-detail">
        最大MPの半分を回復
      </span>
    </button>
  `;
}

renderSkillReward(enemy) {
  this.gameInfo.textContent = "スキル選択";

  this.messageArea.innerHTML = `
    <h2>習得するスキルを選んでください</h2>
  `;

  this.buttonArea.innerHTML = enemy.skills
    .map(
      (skill, index) => `
        <button
          type="button"
          data-action="select-reward-skill"
          data-skill-index="${index}"
        >
          ${skill.name}
          <br>
          消費MP：${skill.costMp}
        </button>
      `,
    )
    .join("");
}
}