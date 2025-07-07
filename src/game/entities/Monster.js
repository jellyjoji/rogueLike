export class Monster {
  constructor(stage) {
    this.stage = stage;
    this.hp = this.calculateInitialHp();
    this.attack = this.calculateInitialAttack();
  }

  calculateInitialHp() {
    return Math.floor(50 * Math.pow(1.2, this.stage - 1));
  }

  calculateInitialAttack() {
    return Math.floor(5 * Math.pow(1.15, this.stage - 1));
  }

  takeDamage(damage) {
    this.hp -= damage;
    return this.hp <= 0;
  }

  attackPlayer() {
    return this.attack;
  }
}
