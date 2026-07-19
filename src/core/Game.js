import { GamePhase } from "../constants/GamePhase.js";

export class Game {
  constructor({ characters, screen, inputController }) {
    this.characters = characters;
    this.screen = screen;
    this.inputController = inputController;

    this.phase = GamePhase.TITLE;
    this.player = null;
    this.enemy = null;
    this.winStreak = 0;
  }

  start() {
    this.inputController.setButtonClickHandler((action) => {
      this.handleAction(action);
    });

    this.screen.renderTitle();
  }

  handleAction(action) {
    if (action === "start-game") {
      this.showPlayerSelect();
    }
  }

  showPlayerSelect() {
    this.phase = GamePhase.PLAYER_SELECT;

    this.screen.leaveTitle();
    this.screen.renderPlayerSelect(this.characters);
  }
}