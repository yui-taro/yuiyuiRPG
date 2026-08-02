//ゲームを起動する入口
//データを読み込む→ 必要なクラスを作る→ Gameにまとめて渡す→ ゲームを開始する
import { CharacterLoader } from "./data/CharacterLoader.js";
import { Screen } from "./ui/Screen.js";
import { InputController } from "./ui/InputController.js";
import { BattleSystem } from "./systems/BattleSystem.js";
import { RewardSystem } from "./systems/RewardSystem.js";
import { Game } from "./core/Game.js";

//実際に画面を表示させるためにオブジェクトを作成
const screen = new Screen();
//実際にボタンを使うためにhtmlのボタンを引数としてオブジェクト作成
const inputController = new InputController(screen.buttonArea);

try {
  //関数の中に入ってなくてもmoduleのおかげでawaitを使える
  //jsonを読んで、キャラクターの配列が返される
  const characters = await CharacterLoader.loadCharacters();

  const battleSystem = new BattleSystem();
  const rewardSystem = new RewardSystem();
  //ゲーム管理用のオブジェクト。
  const game = new Game({
    //loadCharacters()ですでに持ってる配列
    //
    characters,
    screen,
    inputController,
    battleSystem,
    rewardSystem,
  });
//★game.jsに移動
  game.start();
} catch (error) {
  console.error("ゲームデータの読み込みに失敗しました。", error);

  //ボタンがクリックされたとき、そのボタンが再読み込みボタンならページを更新する
  //InputControllerから情報が渡され、actionの情報のみ取り出す
  inputController.setButtonClickHandler((input) => {
  const action = input.action;
    //押されたボタンの名前がreload-gameなら、
    if (action === "reload-game") {
      //windowクラスのメソッドで、今開いてるページをlocationで示し、再読み込みする
      window.location.reload();
    }
  });

  //エラー表示のメソッドが動く
  screen.renderLoadError();
}
