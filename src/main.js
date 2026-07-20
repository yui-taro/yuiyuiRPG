import { fileChange } from "./data/fileChange.js";
import { Screen } from "./ui/Screen.js";
import { InputController } from "./ui/InputController.js";
import { BattleSystem } from "./systems/BattleSystem.js";
import { RewardSystem } from "./systems/RewardSystem.js";
import { Game } from "./core/Game.js";

const characters = await fileChange.loadCharacters();

const screen = new Screen();

const inputController = new InputController(
  screen.buttonArea,
);

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