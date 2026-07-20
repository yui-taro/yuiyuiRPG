//character.json を読み込んで、Skill と Character に変換する

import { Character } from "../models/Character.js";
import { Skill } from "../models/Skill.js";

export class fileChange {
    //loadCharactersはキャラクターを読み込むメソッド
    //async=時間のかかる処理,セットでawait=読み込みが終わるまで次の処理しない
    //staticにしとくとほかのクラスでnewしなくても使える
  static async loadCharacters() {
    //fetch()は、ファイルからデータを読み込む機能
    //responseは、既存機能。okやstatesなどが入る
    const response = await fetch("./character.json");

    //読み込み不可ならエラー
    if (!response.ok) {
      throw new Error("character.jsonの読み込みに失敗しました");
    }

    //response.json()-jsonを使えるように変換するメソッド
    const characterDataList = await response.json();

    //変換したCharacterを入れるための配列をつくる
    const characters = [];

    //一個ずつ入れて回す
    for (const characterData of characterDataList) {
      const skills = [];

      // 今見てるキャラのskillを取り出す
      for (const skillData of characterData.skills) {
        const skill = new Skill({
          name: skillData.name,
          costMp: skillData.cost_mp,
          hpToEnemy: skillData.hp_to_enemy,
          hpToSelf: skillData.hp_to_self,
          mpToSelf: skillData.mp_to_self,
          mpToEnemy: skillData.mp_to_enemy,
          atkToEnemy: skillData.atk_to_enemy,
          atkToSelf: skillData.atk_to_self,
          defToEnemy: skillData.def_to_enemy,
          defToSelf: skillData.def_to_self,
          description: skillData.description,
        });

        //完成したskillをskillsに入れる
        skills.push(skill);
      }

      //Characterクラスから新しいキャラクターを作る
      const character = new Character({
        name: characterData.name,
        level: 1,
        hp: characterData.hp,
        mp: characterData.mp,
        atk: characterData.atk,
        def: characterData.def,
        skills: skills,
        image: getImagePath(characterData.name),
      });

      characters.push(character);
    }

    return characters;
  }
}

const getImagePath = (characterName) => {
  const imageMap = {
   "戦士": "images/warrior.png",
  "魔法使い": "images/mage.png",
    "聖騎士": "images/paladin.png",
    "暗殺者": "images/assassin.png",
    "岩ゴーレム": "images/rock-golem.png",
    "吸血鬼の王": "images/vampire-rode.png",
  };

  //nullまたはundefinedだったら、空文字を返す
  //オブジェクトの値を呼び出す場合は[]を使用
  return imageMap[characterName] ?? "";
}