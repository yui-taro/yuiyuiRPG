export class EnemyFactory {
  /*
   * 選択したプレイヤー以外から敵をランダムに作成する
   *
   * @param {Character[]} characters 全キャラクター
   * @param {Character} player 選択されたプレイヤー
   * @returns {Character} 生成された敵
   */

  //作成するメソッドなのでstaticでnewしない設計に

  static createRandomEnemy(characters, player, winStreak) {
    // filter()は、条件に合う要素だけで新しい配列を作る既存メソッド
    //敵候補
    const enemyCandidates = characters.filter(
      (character) => character.name !== player.name,
    );

    if (enemyCandidates.length === 0) {
      throw new Error("敵候補が存在しません");
    }

    //jsでランダムな整数をつくる関数がない
    // Math.random()は0以上1未満のランダムな小数を作る既存機能
    //掛け算して整数に戻す
    // Math.floor()は小数点以下を切り捨てる既存機能
    const randomCharacterIndex = Math.floor(
      Math.random() * enemyCandidates.length,
    );

    const selectedCharacter = enemyCandidates[randomCharacterIndex];

    // clone()は元データを変えずに複製する自作メソッド
    const enemy = selectedCharacter.clone();

    //連勝数ごとにれべるらんだむ
    enemy.level = this.createRandomLevel(winStreak);

    this.applyLevelStats(enemy);

    return enemy;
  }

  static createRandomLevel(winStreak) {
    // 最低でも上限を1にする
    const maxLevel = Math.max(1, winStreak);

    // 1以上maxLevel以下のランダムな整数を作る
    return Math.floor(Math.random() * maxLevel) + 1;
  }

  //れべるごとにステータス変える
  static applyLevelStats(enemy) {
    const additionalLevel = enemy.level - 1;

    enemy.maxHp += additionalLevel * 20;
    enemy.maxMp += additionalLevel * 10;
    enemy.atk += additionalLevel * 5;
    enemy.def += additionalLevel * 5;

    enemy.hp = enemy.maxHp;
    enemy.mp = enemy.maxMp;
  }
}
