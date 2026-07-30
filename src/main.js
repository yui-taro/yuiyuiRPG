import { CharacterLorder } from "./data/CharacterLorder.js";
import { Screen } from "./ui/Screen.js";
import { InputController } from "./ui/InputController.js";
import { BattleSystem } from "./systems/BattleSystem.js";
import { RewardSystem } from "./systems/RewardSystem.js";
import { Game } from "./core/Game.js";

const screen = new Screen();
const inputController = new InputController(screen.buttonArea);

try {
  const characters = await CharacterLorder.loadCharacters();

  const battleSystem = new BattleSystem();
  const rewardSystem = new RewardSystem();
  const game = new Game({
    characters,
    screen,
    inputController,
    battleSystem,
    rewardSystem,
  });

  game.start();
} catch (error) {
  console.error("ゲームデータの読み込みに失敗しました。", error);

  inputController.setButtonClickHandler(({ action }) => {
    if (action === "reload-game") {
      window.location.reload();
    }
  });

  screen.renderLoadError();
}
