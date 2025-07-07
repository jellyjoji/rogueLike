export class Monster {
  constructor(stage) {
    this.stage = stage;
    this.maxHp = this.calculateInitialHp();
    this.hp = this.maxHp;
    this.baseAttack = this.calculateInitialAttack();
    this.rage = 1.0; // 분노 게이지
    this.consecutive_hits = 0; // 연속 공격 성공 횟수
  }

  calculateInitialHp() {
    // 스테이지가 올라갈 수록 지수적으로 증가하되, 랜덤성 추가
    const baseHp = 50 * Math.pow(1.2, this.stage - 1);
    const randomMultiplier = 0.8 + Math.random() * 0.4; // 80%~120%
    return Math.floor(baseHp * randomMultiplier);
  }

  calculateInitialAttack() {
    // 스테이지가 올라갈 수록 지수적으로 증가하되, 랜덤성 추가
    const baseAttack = 5 * Math.pow(1.15, this.stage - 1);
    const randomMultiplier = 0.9 + Math.random() * 0.2; // 90%~110%
    return Math.floor(baseAttack * randomMultiplier);
  }

  takeDamage(damage) {
    this.hp -= damage;
    // 체력이 낮을수록 분노 게이지 증가
    if (this.hp > 0) {
      const hpRatio = this.hp / this.maxHp;
      this.rage = Math.min(2.0, this.rage + 0.1 * (1 - hpRatio));
    }
    return this.hp <= 0;
  }

  attackPlayer() {
    let damage = this.baseAttack;

    // 분노 상태에 따른 추가 데미지
    damage *= this.rage;

    // 연속 공격 성공시 추가 데미지
    if (this.consecutive_hits > 0) {
      damage *= 1 + this.consecutive_hits * 0.1;
    }

    // 20% 확률로 특수 공격
    if (Math.random() < 0.2) {
      this.consecutive_hits++;
      return {
        damage: Math.floor(damage * 1.5),
        type: "special",
        consecutive: this.consecutive_hits,
      };
    }

    // 일반 공격
    if (Math.random() < 0.7) {
      this.consecutive_hits++;
      return {
        damage: Math.floor(damage),
        type: "normal",
        consecutive: this.consecutive_hits,
      };
    }

    // 공격 실패
    this.consecutive_hits = 0;
    return {
      damage: 0,
      type: "miss",
      consecutive: 0,
    };
  }
}
