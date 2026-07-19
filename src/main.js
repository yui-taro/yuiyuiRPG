import { fileChange } from "./data/fileChange.js";
import { Screen } from "./ui/Screen.js";
import { InputController } from "./ui/InputController.js";
import { Game } from "./core/Game.js";

const characters = await fileChange.loadCharacters();

const screen = new Screen();
const inputController = new InputController(screen.buttonArea);

const game = new Game({
  characters: characters,
  screen: screen,
  inputController: inputController,
});

game.start();