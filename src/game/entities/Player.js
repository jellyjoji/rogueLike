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
    return this.calculateDamage();
  }

  comboAttack() {
    if (Math.random() * 100 < this.comboChance) {
      return [this.calculateDamage(), this.calculateDamage()];
    }
    return [this.calculateDamage()];
  }

  defend(incomingDamage) {
    if (Math.random() * 100 < this.defenseRate) {
      return {
        success: true,
        counterDamage: Math.floor(this.calculateDamage() * 0.6),
      };
    }
    this.hp -= incomingDamage;
    return {
      success: false,
      counterDamage: 0,
    };
  }

  tryEscape() {
    return Math.random() * 100 < this.escapeChance;
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
