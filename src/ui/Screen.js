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

    this.gameInfo.style.display = "";
    this.playerStatus.style.display = "";
    this.enemyStatus.style.display = "";

    this.playerImage.style.display = "";
    this.enemyImage.style.display = "";
  }

  renderPlayerSelect(characters) {
  this.gameInfo.textContent = "キャラクター選択";

  this.playerStatus.textContent = "";
  this.enemyStatus.textContent = "";

  this.playerImage.removeAttribute("src");
  this.enemyImage.removeAttribute("src");

  this.messageArea.innerHTML = `
    <h2>使用するキャラクターを選んでください</h2>
  `;

  this.buttonArea.innerHTML = "";

  characters.forEach((character, index) => {
    this.buttonArea.innerHTML += `
      <button
        type="button"
        data-action="select-player"
        data-character-index="${index}"
      >
        ${character.name}
      </button>
    `;
  });
}
renderBattle(player, enemy, message) {
  document.body.classList.remove("title-screen");
  document.body.classList.add("battle-screen");

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
  `;

  this.enemyStatus.innerHTML = `
    <h2>${enemy.name}</h2>
    <p>Lv.${enemy.level}</p>
    <p>HP：${enemy.hp} / ${enemy.maxHp}</p>
    <p>MP：${enemy.mp} / ${enemy.maxMp}</p>
  `;

  this.playerImage.src = player.image;
  this.playerImage.alt = player.name;

  this.enemyImage.src = enemy.image;
  this.enemyImage.alt = enemy.name;

  this.messageArea.textContent = message;

  this.buttonArea.innerHTML = `
    <button
      type="button"
      data-action="normal-attack"
    >
      通常攻撃
    </button>

    ${player.skills
      .map(
        (skill, index) => `
          <button
            type="button"
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
}