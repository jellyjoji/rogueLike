import { Player } from "./entities/Player";
import { Monster } from "./entities/Monster";

export class GameController {
  constructor() {
    this.player = new Player();
    this.monster = new Monster(this.player.stage);
    this.isGameOver = false;
    this.turnCount = 0;
  }

  performAction(action) {
    if (this.isGameOver) return { gameOver: true };

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
          result.specialEffects.push("치명타!");
        }
        this.handleMonsterDamage(result);
        break;

      case "combo":
        const comboDamages = this.player.comboAttack();
        result.playerDamage = comboDamages.reduce((a, b) => a + b, 0);
        result.specialEffects.push(`${comboDamages.length}연속 공격!`);
        if (comboDamages.length > 2) {
          result.specialEffects.push("완벽한 연계!");
        }
        this.handleMonsterDamage(result);
        break;

      case "defend":
        const monsterAttack = this.monster.attackPlayer();
        const defenseResult = this.player.defend(monsterAttack.damage);

        if (defenseResult.success) {
          result.playerDamage = defenseResult.counterDamage;
          result.specialEffects.push("방어 성공!");
          if (defenseResult.perfect) {
            result.specialEffects.push("완벽한 방어!");
          }
          this.handleMonsterDamage(result);
        } else {
          result.monsterDamage = monsterAttack.damage;
          if (monsterAttack.type === "special") {
            result.specialEffects.push("몬스터의 특수 공격!");
          }
          if (monsterAttack.consecutive > 1) {
            result.specialEffects.push(
              `몬스터의 ${monsterAttack.consecutive}연속 공격!`
            );
          }
        }
        break;

      case "escape":
        if (this.player.tryEscape()) {
          result.escaped = true;
          result.stageCleared = true;
          result.specialEffects.push("도망 성공!");
        } else {
          const monsterAttack = this.monster.attackPlayer();
          result.monsterDamage = monsterAttack.damage;
          result.specialEffects.push("도망 실패!");
          this.player.hp -= result.monsterDamage;
        }
        break;
    }

    // 몬스터의 반격 (방어나 도망이 아닐 경우)
    if (!result.escaped && action !== "defend") {
      const monsterAttack = this.monster.attackPlayer();
      result.monsterDamage = monsterAttack.damage;
      if (monsterAttack.type === "special") {
        result.specialEffects.push("몬스터의 특수 공격!");
      }
      if (monsterAttack.type === "miss") {
        result.specialEffects.push("몬스터의 공격 빗나감!");
      }
      this.player.hp -= result.monsterDamage;
    }

    // 게임 오버 체크
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      result.gameOver = true;
      return result;
    }

    // 스테이지 클리어 체크
    if (this.monster.hp <= 0) {
      result.stageCleared = true;
      result.specialEffects.push("스테이지 클리어!");
      this.handleStageCleared(result);
    }

    return result;
  }

  handleMonsterDamage(result) {
    const monsterDefeated = this.monster.takeDamage(result.playerDamage);
    if (monsterDefeated) {
      result.stageCleared = true;
    }
  }

  handleStageCleared(result) {
    // 체력 회복 (현재 최대 체력의 30%)
    const healAmount = Math.floor(this.player.maxHp * 0.3);
    this.player.heal(healAmount);
    result.specialEffects.push(`체력 회복: +${healAmount}`);

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
    switch (randomStat) {
      case "hp":
        result.specialEffects.push(
          `최대 체력 증가: ${oldStats.maxHp} → ${this.player.maxHp}`
        );
        break;
      case "minAttack":
        result.specialEffects.push(
          `최소 공격력 증가: ${oldStats.minAttack} → ${this.player.minAttack}`
        );
        break;
      case "maxAttackMultiplier":
        result.specialEffects.push(
          `최대 공격력 배율 증가: ${oldStats.maxAttackMultiplier.toFixed(
            1
          )} → ${this.player.maxAttackMultiplier.toFixed(1)}`
        );
        break;
      case "escapeChance":
        result.specialEffects.push(
          `도망 확률 증가: ${oldStats.escapeChance}% → ${this.player.escapeChance}%`
        );
        break;
      case "comboChance":
        result.specialEffects.push(
          `연속 공격 확률 증가: ${oldStats.comboChance}% → ${this.player.comboChance}%`
        );
        break;
      case "defenseRate":
        result.specialEffects.push(
          `방어율 증가: ${oldStats.defenseRate}% → ${this.player.defenseRate}%`
        );
        break;
    }

    // 다음 스테이지로 진행
    this.player.stage++;
    this.monster = new Monster(this.player.stage);
    result.specialEffects.push(`스테이지 ${this.player.stage} 시작!`);
  }
}
