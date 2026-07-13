//this.name = nameとかすると、メンバ変数書かなくてもセットされる

export class Skill {
  constructor({
    name,
    costMp,
    hpToEnemy,
    hpToSelf,
    mpToEnemy,
    mpToSelf,
    atkToEnemy,
    atkToSelf,
    defToEnemy,
    defToSelf,
    description,
  }) {
    this.name = name;
    this.costMp = costMp;
    this.hpToEnemy = hpToEnemy;
    this.hpToSelf = hpToSelf;
    this.mpToEnemy = mpToEnemy;
    this.mpToSelf = mpToSelf;
    this.atkToEnemy = atkToEnemy;
    this.atkToSelf = atkToSelf;
    this.defToEnemy = defToEnemy;
    this.defToSelf = defToSelf;
    this.description = description;
  }
}