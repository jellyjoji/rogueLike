export class Player {
  constructor() {
    this.hp = 100;
    this.maxHp = 100;
    this.minAttack = 10;
    this.maxAttackMultiplier = 1.5;
    this.escapeChance = 30; // 30%
    this.comboChance = 20; // 20%
    this.defenseRate = 30; // 30%
    this.stage = 1;
    this.consecutiveDefends = 0; // 연속 방어 횟수
    this.comboStreak = 0; // 연속 공격 성공 횟수
    this.lastAction = null; // 마지막 행동
  }

  get maxAttack() {
    return Math.floor(this.minAttack * this.maxAttackMultiplier);
  }

  calculateDamage() {
    return (
      Math.floor(Math.random() * (this.maxAttack - this.minAttack + 1)) +
      this.minAttack
    );
  }

  attack() {
    this.comboStreak = 0;
    this.consecutiveDefends = 0;
    this.lastAction = "attack";
    const damage = this.calculateDamage();
    // 10% 확률로 치명타
    if (Math.random() < 0.1) {
      return {
        damage: Math.floor(damage * 1.5),
        critical: true,
      };
    }
    return {
      damage,
      critical: false,
    };
  }

  comboAttack() {
    const baseChance = this.comboChance;
    // 이전에도 연속공격을 했다면 확률 증가
    const bonusChance = this.lastAction === "combo" ? this.comboStreak * 5 : 0;

    if (Math.random() * 100 < baseChance + bonusChance) {
      this.comboStreak++;
      this.lastAction = "combo";
      // 연속공격 성공 스트릭에 따라 2~3번 공격
      const attacks = new Array(this.comboStreak > 2 ? 3 : 2)
        .fill(0)
        .map(() => this.calculateDamage());
      return attacks;
    }

    this.comboStreak = 0;
    this.lastAction = "combo";
    return [this.calculateDamage()];
  }

  defend(incomingDamage) {
    const baseDefenseRate = this.defenseRate;
    // 연속으로 방어할수록 방어 확률 감소
    const actualDefenseRate = baseDefenseRate - this.consecutiveDefends * 5;

    if (Math.random() * 100 < actualDefenseRate) {
      this.consecutiveDefends++;
      this.lastAction = "defend";

      // 연속 방어 성공시 반격 데미지 증가
      const counterMultiplier = 0.6 + this.consecutiveDefends * 0.1;
      return {
        success: true,
        counterDamage: Math.floor(this.calculateDamage() * counterMultiplier),
        perfect: this.consecutiveDefends > 2,
      };
    }

    this.hp -= incomingDamage;
    this.consecutiveDefends = 0;
    this.lastAction = "defend";
    return {
      success: false,
      counterDamage: 0,
      perfect: false,
    };
  }

  tryEscape() {
    const baseEscapeChance = this.escapeChance;
    // HP가 낮을수록 도망 확률 증가
    const hpRatio = this.hp / this.maxHp;
    const bonusEscapeChance = (1 - hpRatio) * 20;

    return Math.random() * 100 < baseEscapeChance + bonusEscapeChance;
  }

  heal(amount) {
    this.hp = Math.min(this.maxHp, this.hp + amount);
  }

  upgradeStats(stat) {
    switch (stat) {
      case "hp":
        const hpIncrease = Math.floor(Math.random() * 31) + 20; // 20~50
        this.maxHp += hpIncrease;
        this.hp += hpIncrease;
        break;
      case "minAttack":
        this.minAttack += Math.floor(Math.random() * 16) + 5; // 5~20
        break;
      case "maxAttackMultiplier":
        this.maxAttackMultiplier += Math.random() * 0.9 + 0.1; // 0.1~1
        break;
      case "escapeChance":
        this.escapeChance += Math.floor(Math.random() * 3) + 1; // 1~3
        break;
      case "comboChance":
        this.comboChance += Math.floor(Math.random() * 5) + 3; // 3~7
        break;
      case "defenseRate":
        this.defenseRate += Math.floor(Math.random() * 8) + 3; // 3~10
        break;
    }
  }
}
