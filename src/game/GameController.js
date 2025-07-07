import { Player } from "./entities/Player";
import { Monster } from "./entities/Monster";

const MESSAGES = {
  en: {
    critical: "Critical hit!",
    combo: (n) => `${n}-hit combo!`,
    perfectCombo: "Perfect combo!",
    defendSuccess: "Defense success!",
    perfectDefend: "Perfect defense!",
    monsterSpecial: "Monster's special attack!",
    monsterCombo: (n) => `Monster's ${n}-hit combo!`,
    escapeSuccess: "Escaped!",
    escapeFail: "Escape failed!",
    monsterMiss: "Monster missed!",
    stageClear: "Stage clear!",
    heal: (v) => `Heal: +${v}`,
    statUp: {
      hp: (o, n) => `Max HP: ${o} → ${n}`,
      minAttack: (o, n) => `Min ATK: ${o} → ${n}`,
      maxAttackMultiplier: (o, n) => `Max ATK Multiplier: ${o} → ${n}`,
      escapeChance: (o, n) => `Escape chance: ${o}% → ${n}%`,
      comboChance: (o, n) => `Combo chance: ${o}% → ${n}%`,
      defenseRate: (o, n) => `Defense rate: ${o}% → ${n}%`,
    },
    nextStage: (n) => `Stage ${n} start!`,
    gameOver: "Game Over!",
  },
  ko: {
    critical: "치명타!",
    combo: (n) => `${n}연속 공격!`,
    perfectCombo: "완벽한 연계!",
    defendSuccess: "방어 성공!",
    perfectDefend: "완벽한 방어!",
    monsterSpecial: "몬스터의 특수 공격!",
    monsterCombo: (n) => `몬스터의 ${n}연속 공격!`,
    escapeSuccess: "도망 성공!",
    escapeFail: "도망 실패!",
    monsterMiss: "몬스터의 공격 빗나감!",
    stageClear: "스테이지 클리어!",
    heal: (v) => `체력 회복: +${v}`,
    statUp: {
      hp: (o, n) => `최대 체력 증가: ${o} → ${n}`,
      minAttack: (o, n) => `최소 공격력 증가: ${o} → ${n}`,
      maxAttackMultiplier: (o, n) => `최대 공격력 배율 증가: ${o} → ${n}`,
      escapeChance: (o, n) => `도망 확률 증가: ${o}% → ${n}%`,
      comboChance: (o, n) => `연속 공격 확률 증가: ${o}% → ${n}%`,
      defenseRate: (o, n) => `방어율 증가: ${o}% → ${n}%`,
    },
    nextStage: (n) => `스테이지 ${n} 시작!`,
    gameOver: "게임 오버!",
  },
};

export class GameController {
  constructor(language = "ko") {
    this.player = new Player();
    this.monster = new Monster(this.player.stage);
    this.isGameOver = false;
    this.turnCount = 0;
    this.language = language;
  }

  setLanguage(lang) {
    this.language = lang;
  }

  performAction(action) {
    if (this.isGameOver) return { gameOver: true };
    const t = MESSAGES[this.language];
    this.turnCount++;

    let result = {
      playerAction: action,
      playerDamage: 0,
      monsterDamage: 0,
      escaped: false,
      gameOver: false,
      stageCleared: false,
      specialEffects: [],
    };

    // 플레이어 행동 처리
    switch (action) {
      case "attack":
        const attackResult = this.player.attack();
        result.playerDamage = attackResult.damage;
        if (attackResult.critical) {
          result.specialEffects.push(t.critical);
        }
        this.handleMonsterDamage(result);
        break;

      case "combo":
        const comboDamages = this.player.comboAttack();
        result.playerDamage = comboDamages.reduce((a, b) => a + b, 0);
        result.specialEffects.push(t.combo(comboDamages.length));
        if (comboDamages.length > 2) {
          result.specialEffects.push(t.perfectCombo);
        }
        this.handleMonsterDamage(result);
        break;

      case "defend":
        const monsterAttack = this.monster.attackPlayer();
        const defenseResult = this.player.defend(monsterAttack.damage);

        if (defenseResult.success) {
          result.playerDamage = defenseResult.counterDamage;
          result.specialEffects.push(t.defendSuccess);
          if (defenseResult.perfect) {
            result.specialEffects.push(t.perfectDefend);
          }
          this.handleMonsterDamage(result);
        } else {
          result.monsterDamage = monsterAttack.damage;
          if (monsterAttack.type === "special") {
            result.specialEffects.push(t.monsterSpecial);
          }
          if (monsterAttack.consecutive > 1) {
            result.specialEffects.push(
              t.monsterCombo(monsterAttack.consecutive)
            );
          }
        }
        break;

      case "escape":
        if (this.player.tryEscape()) {
          result.escaped = true;
          result.stageCleared = true;
          result.specialEffects.push(t.escapeSuccess);
        } else {
          const monsterAttack = this.monster.attackPlayer();
          result.monsterDamage = monsterAttack.damage;
          result.specialEffects.push(t.escapeFail);
          this.player.hp -= result.monsterDamage;
        }
        break;
    }

    // 몬스터의 반격 (방어나 도망이 아닐 경우)
    if (!result.escaped && action !== "defend") {
      const monsterAttack = this.monster.attackPlayer();
      result.monsterDamage = monsterAttack.damage;
      if (monsterAttack.type === "special") {
        result.specialEffects.push(t.monsterSpecial);
      }
      if (monsterAttack.type === "miss") {
        result.specialEffects.push(t.monsterMiss);
      }
      this.player.hp -= result.monsterDamage;
    }

    // 게임 오버 체크
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      result.gameOver = true;
      result.specialEffects.push(t.gameOver);
      return result;
    }

    // 스테이지 클리어 체크
    if (this.monster.hp <= 0) {
      result.stageCleared = true;
      result.specialEffects.push(t.stageClear);
      this.handleStageCleared(result, t);
    }

    return result;
  }

  handleMonsterDamage(result) {
    const monsterDefeated = this.monster.takeDamage(result.playerDamage);
    if (monsterDefeated) {
      result.stageCleared = true;
    }
  }

  handleStageCleared(result, t) {
    // 체력 회복 (현재 최대 체력의 30%)
    const healAmount = Math.floor(this.player.maxHp * 0.3);
    this.player.heal(healAmount);
    result.specialEffects.push(t.heal(healAmount));

    // 랜덤 스탯 강화
    const stats = [
      "hp",
      "minAttack",
      "maxAttackMultiplier",
      "escapeChance",
      "comboChance",
      "defenseRate",
    ];
    const randomStat = stats[Math.floor(Math.random() * stats.length)];

    // 현재 스탯 저장
    const oldStats = { ...this.player };

    this.player.upgradeStats(randomStat);

    // 어떤 스탯이 얼마나 증가했는지 표시
    result.specialEffects.push(
      t.statUp[randomStat](oldStats[randomStat], this.player[randomStat])
    );

    // 다음 스테이지로 진행
    this.player.stage++;
    this.monster = new Monster(this.player.stage);
    result.specialEffects.push(t.nextStage(this.player.stage));
  }
}
