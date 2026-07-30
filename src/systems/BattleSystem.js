// ダメージ計算、スキル使用可否、敵の攻撃、戦闘結果

export class BattleSystem {
  normalAttack(attacker, defender) {
    // maxは値の中で一番大きい値を返す。これで最低が1になる
    const damage = Math.max(1, attacker.atk - defender.def);
    // characterクラスのメソッド
    defender.takeDamage(damage);

    // 結果をgameに返す
    return {
      damage,
      message:
        `${attacker.name}の通常攻撃!` + `${defender.name}に${damage}ダメージ!`,
    };
  }

  useSkill(user, target, skill) {
    // null,undefinedの時
    if (!skill) {
      return {
        success: false,
        message: "選択されたスキルが存在しません。",
      };
    }
    if (user.mp < skill.costMp) {
      return {
        success: false,
        message: `${user.name}のMPが足りません!`,
      };
    }

    user.useMp(skill.costMp);

    // スキル使用メッセージを配列に追加していく
    const messages = [`${user.name}は${skill.name}を使用した！`];

    this.applyTargetEffects(target, skill, messages);
    this.applySelfEffects(user, skill, messages);

    return {
      success: true,
      // joinは要素を、指定した文字(改行など)でつないで文字列にする
      message: messages.join("\n"),
    };
  }

  createEnemyAction(enemy) {
    const usableSkills = enemy.skills.filter(
      (skill) => skill.costMp <= enemy.mp,
    );

    // 通常攻撃分増やす
    const actionCount = usableSkills.length + 1;

    const randomIndex = Math.floor(Math.random() * actionCount);

    const normalAttackIndex = usableSkills.length;

    if (randomIndex === normalAttackIndex) {
      return {
        type: "normalAttack",
      };
    }
    return {
      type: "skill",
      skill: usableSkills[randomIndex],
    };
  }

  executeEnemyTurn(enemy, player) {
    const action = this.createEnemyAction(enemy);

    if (action.type === "normalAttack") {
      return this.normalAttack(enemy, player);
    }

    return this.useSkill(enemy, player, action.skill);
  }

  getBattleResult(player, enemy) {
    if (!player.isAlive()) {
      return "playerDefeated";
    }

    if (!enemy.isAlive()) {
      return "enemyDefeated";
    }

    return "continue";
  }

  applyTargetEffects(target, skill, messages) {
    if (skill.hpToEnemy < 0) {
      const damage = -skill.hpToEnemy;

      target.takeDamage(damage);

      messages.push(`${target.name}に${damage}ダメージ！`);
    }

    if (skill.hpToEnemy > 0) {
      target.healHp(skill.hpToEnemy);

      messages.push(`${target.name}のHPが` + `${skill.hpToEnemy}回復した！`);
    }

    if (skill.mpToEnemy !== 0) {
      target.mp += skill.mpToEnemy;

      target.mp = Math.max(0, Math.min(target.mp, target.maxMp));

      messages.push(`${target.name}のMPが変化した！`);
    }

    if (skill.atkToEnemy !== 0) {
      const atkChange = target.changeAtk(skill.atkToEnemy);

      messages.push(`${target.name}のATKが${atkChange}変化した！`);
    }

    if (skill.defToEnemy !== 0) {
      const defChange = target.changeDef(skill.defToEnemy);

      messages.push(`${target.name}のDEFが${defChange}変化した！`);
    }
  }

  applySelfEffects(user, skill, messages) {
    if (skill.hpToSelf < 0) {
      const damage = -skill.hpToSelf;

      user.takeDamage(damage);

      messages.push(`${user.name}は${damage}ダメージを受けた！`);
    }

    if (skill.hpToSelf > 0) {
      user.healHp(skill.hpToSelf);

      messages.push(`${user.name}のHPが` + `${skill.hpToSelf}回復した！`);
    }

    if (skill.mpToSelf > 0) {
      user.healMp(skill.mpToSelf);

      messages.push(`${user.name}のMPが` + `${skill.mpToSelf}回復した！`);
    }

    if (skill.mpToSelf < 0) {
      user.mp += skill.mpToSelf;
      user.mp = Math.max(0, user.mp);

      messages.push(`${user.name}のMPが減少した!`);
    }

    if (skill.atkToSelf !== 0) {
      const atkChange = user.changeAtk(skill.atkToSelf);

      messages.push(`${user.name}のATKが${atkChange}変化した！`);
    }

    if (skill.defToSelf !== 0) {
      const defChange = user.changeDef(skill.defToSelf);

      messages.push(`${user.name}のDEFが${defChange}変化した！`);
    }
  }
}
