export class RewardSystem {
  applyLevelUp(player) {
    player.levelUp();

    return `${player.name}のレベルが上がった！`;
  }

  applyHpRecovery(player) {
    const recoveryAmount = Math.floor(player.maxHp * 0.5);

    player.healHp(recoveryAmount);

    return `${player.name}のHPが${recoveryAmount}回復した！`;
  }

  applyMpRecovery(player) {
    const recoveryAmount = Math.floor(player.maxMp * 0.5);

    player.healMp(recoveryAmount);

    return `${player.name}のMPが${recoveryAmount}回復した！`;
  }

  applyStealSkill(player, enemy, skillIndex) {
    const index = Number(skillIndex);
    const selectedSkill = enemy.skills[index];

    if (!selectedSkill) {
      return {
        success: false,
        message: "選択されたスキルが存在しません。",
      };
    }

    const added = player.addSkill(selectedSkill);

    if (!added) {
      return {
        success: false,
        message: `${selectedSkill.name}はすでに覚えています。`,
      };
    }

    return {
      success: true,
      message: `${selectedSkill.name}を習得した！`,
    };
  }
}
