export class Character {
  constructor({
    name,
    level = 1,
    hp,
    mp,
    atk,
    def,
    skills = [],
    image = "",
  }) {
    this.name = name;
    this.level = level;

    this.maxHp = hp;
    this.hp = hp;

    this.maxMp = mp;
    this.mp = mp;

    this.atk = atk;
    this.def = def;

    this.skills = skills;
    this.image = image;
  }

  // hpが０以上の場合true
  isAlive() {
    return this.hp > 0;
  }

  // 攻撃
  takeDamage(damage) {
    this.hp -= damage;

    // ゼロ以下になったら０固定
    if (this.hp < 0) {
      this.hp = 0;
    }
  }

  // hp回復
  healHp(amount) {
    this.hp += amount;

    if (this.hp > this.maxHp) {
      this.hp = this.maxHp;
    }
  }

  // mp回復
  healMp(amount) {
    this.mp += amount;

    if (this.mp > this.maxMp) {
      this.mp = this.maxMp;
    }
  }

  // スキルでmp使用
  useMp(cost) {
    this.mp -= cost;

    if (this.mp < 0) {
      this.mp = 0;
    }
  }

  // 選択：レベルアップ
  levelUp() {
    this.level += 1;

    this.maxHp += 20;
    this.maxMp += 10;
    this.atk += 10;
    this.def += 10;

    this.hp += 20;
    this.mp += 10;
  }

  // 指定のスキルを持ってるかチェック
  hasSkill(skillName) {
    // some() は、配列の中に 条件に合うものが1つでもあるか を調べるメソッド
    return this.skills.some((skill) => skill.name === skillName);
  }

  // その名前のスキルがなければスキル追加する
  addSkill(skill) {
    if (this.hasSkill(skill.name)) {
      return false;
    }

    // pushは追加するメソッド
    this.skills.push(skill);
    return true;
  }

  // 本体の値を変えないようにここで動かす
  clone() {
    return new Character({
      name: this.name,
      level: this.level,
      hp: this.maxHp,
      mp: this.maxMp,
      atk: this.atk,
      def: this.def,
      skills: [...this.skills],
      image: this.image,
    });
  }
}
