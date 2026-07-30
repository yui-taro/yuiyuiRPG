//ボタン操作を受け取り、その情報をgameに入れる

export class InputController {
  constructor(buttonArea) {
    this.buttonArea = buttonArea;
  }

  //クリック時の処理を登録
  setButtonClickHandler(onButtonClick) {
    //引数が必要のためこの書き方
    this.buttonArea.addEventListener("click", (event) => {
      //targetは、イベントに発生したhtml要素を取得
      const clickedButton = event.target.closest("button");

      if (!clickedButton) {
        return;
      }

      onButtonClick({
        action: clickedButton.dataset.action,
        characterIndex: clickedButton.dataset.characterIndex,
        skillIndex: clickedButton.dataset.skillIndex,
      });
    });
  }
}
