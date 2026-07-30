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

  // すべての画面を一旦削除し、必要な画面のみ引数で指定し表示
  setScreenClass(screenClass) {
    document.body.classList.remove(
      "title-screen",
      "player-select-screen",
      "battle-screen",
      "reward-screen",
    );

    document.body.classList.add(screenClass);
  }

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

  renderTitle() {
    this.setScreenClass("title-screen");

    this.gameInfo.textContent = "";

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

  renderLoadError() {
    this.setScreenClass("title-screen");

    this.gameInfo.textContent = "";

    this.messageArea.innerHTML = `
      <div class="title-content">
        <h1 class="game-title">YUI RPG</h1>
        <p class="load-error-message">
          ゲームデータを読み込めませんでした。<br>
          通信状態やデータの内容を確認して、再読み込みしてください。
        </p>
      </div>
    `;

    this.buttonArea.innerHTML = `
      <button
        type="button"
        class="start-button"
        data-action="reload-game"
      >
        再読み込み
      </button>
    `;
  }

  renderPlayerSelect(characters) {
    this.setScreenClass("player-select-screen");

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
            class="menu-card character-select-card"
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

  renderBattle(player, enemy, message, winStreak) {
    this.setScreenClass("battle-screen");

    this.gameInfo.textContent = `連勝数：${winStreak}`;

    this.playerStatus.innerHTML = this.createStatusHtml(player);

    this.enemyStatus.innerHTML = this.createStatusHtml(enemy);

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
              class="menu-card game-action-button"
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

  renderReward(enemy, winStreak) {
    this.setScreenClass("reward-screen");

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
        class="menu-card reward-card"
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
        class="menu-card reward-card"
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
        class="menu-card reward-card"
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
        class="menu-card reward-card"
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

  renderSkillReward(enemy, player, errorMessage = "") {
    const availableSkills = enemy.skills
      .map((skill, index) => ({ skill, index }))
      .filter(({ skill }) => !player.hasSkill(skill.name));

    this.messageArea.innerHTML = `
      <h2>習得するスキルを選んでください</h2>
      ${
        errorMessage
          ? `<p class="reward-error">${errorMessage}</p>`
          : ""
      }
      ${
        availableSkills.length === 0
          ? `
            <p class="reward-error">
              習得できる新しいスキルがありません。
            </p>
          `
          : ""
      }
    `;

    this.buttonArea.innerHTML =
      availableSkills
        .map(
          ({ skill, index }) => `
          <button
            type="button"
            class="menu-card reward-card"
            data-action="select-reward-skill"
            data-skill-index="${index}"
          >
            <span class="reward-name">
              ${skill.name}
            </span>
            <span class="reward-detail">
              消費MP：${skill.costMp}
            </span>
          </button>
        `,
        )
        .join("") +
      `
        <button
          type="button"
          class="menu-card reward-card"
          data-action="back-to-reward"
        >
          <span class="reward-name">
            報酬選択へ戻る
          </span>
        </button>
      `;
  }

  renderGameOver(player, enemy, message, winStreak) {
    this.renderBattle(player, enemy, message, winStreak);

    this.buttonArea.innerHTML = `
      <button
        type="button"
        class="menu-card game-action-button"
        data-action="restart-game"
      >
        タイトルへ戻る
      </button>
    `;
  }
}
