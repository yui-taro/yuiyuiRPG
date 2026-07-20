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
      const clickedElement = event.target;

      if (!(clickedElement instanceof HTMLButtonElement)) {
        return;
      }

      //datasetはactionの内容を保存
      const action = clickedElement.dataset.action;

      //onButtonClick=イベントの処理によくつける名前
      //
      onButtonClick({
        action: clickedElement.dataset.action,
        characterIndex: clickedElement.dataset.characterIndex,
        skillIndex: clickedElement.dataset.skillIndex,
      });
    });
  }
}