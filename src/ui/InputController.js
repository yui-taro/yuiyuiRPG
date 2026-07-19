export class InputController {
  constructor(buttonArea) {
    this.buttonArea = buttonArea;
  }

  //クリック時の処理を登録
  setButtonClickHandler(handler) {
    //引数が必要のためこの書き方
    this.buttonArea.addEventListener("click", (event) => {
      const clickedElement = event.target;

      if (!(clickedElement instanceof HTMLButtonElement)) {
        return;
      }

      const action = clickedElement.dataset.action;

      handler(action);
    });
  }
}