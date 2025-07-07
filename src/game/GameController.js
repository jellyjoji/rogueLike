import { Player } from "./entities/Player";
import { Monster } from "./entities/Monster";

export class GameController {
  constructor() {
    this.player = new Player();
    this.monster = new Monster(this.player.stage);
    this.isGameOver = false;
  }

  performAction(action) {
    if (this.isGameOver) return { gameOver: true };

    let result = {
      playerAction: action,
      playerDamage: 0,
      monsterDamage: 0,
      escaped: false,
      gameOver: false,
      stageCleared: false,
    };

    switch (action) {
      case "attack":
        result.playerDamage = this.player.attack();
        this.handleMonsterDamage(result);
        break;

      case "combo":
        const comboDamages = this.player.comboAttack();
        result.playerDamage = comboDamages.reduce((a, b) => a + b, 0);
        this.handleMonsterDamage(result);
        break;

      case "defend":
        const monsterAttack = this.monster.attackPlayer();
        const defenseResult = this.player.defend(monsterAttack);
        result.playerDamage = defenseResult.counterDamage;
        if (defenseResult.success) {
          this.handleMonsterDamage(result);
        } else {
          result.monsterDamage = monsterAttack;
        }
        break;

      case "escape":
        if (this.player.tryEscape()) {
          result.escaped = true;
          result.stageCleared = true;
        } else {
          result.monsterDamage = this.monster.attackPlayer();
          this.player.hp -= result.monsterDamage;
        }
        break;
    }

    // If player didn't escape or defend successfully, take monster damage
    if (!result.escaped && action !== "defend") {
      result.monsterDamage = this.monster.attackPlayer();
      this.player.hp -= result.monsterDamage;
    }

    // Check if player died
    if (this.player.hp <= 0) {
      this.isGameOver = true;
      result.gameOver = true;
      return result;
    }

    // Check if stage is cleared
    if (this.monster.hp <= 0) {
      result.stageCleared = true;
      this.handleStageCleared();
    }

    return result;
  }

  handleMonsterDamage(result) {
    const monsterDefeated = this.monster.takeDamage(result.playerDamage);
    if (monsterDefeated) {
      result.stageCleared = true;
    }
  }

  handleStageCleared() {
    // Heal player
    this.player.heal(20);

    // Upgrade random stat
    const stats = [
      "hp",
      "minAttack",
      "maxAttackMultiplier",
      "escapeChance",
      "comboChance",
      "defenseRate",
    ];
    const randomStat = stats[Math.floor(Math.random() * stats.length)];
    this.player.upgradeStats(randomStat);

    // Advance to next stage
    this.player.stage++;
    this.monster = new Monster(this.player.stage);
  }
}
