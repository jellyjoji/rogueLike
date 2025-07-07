"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { GameController } from "../game/GameController";

export default function Home() {
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState({
    message: "",
    lastAction: null,
  });

  useEffect(() => {
    setGame(new GameController());
  }, []);

  const handleAction = (action) => {
    if (!game) return;

    const result = game.performAction(action);
    let message = "";

    if (result.gameOver) {
      message = "게임 오버! 새 게임을 시작하세요.";
      setGame(new GameController());
    } else {
      if (result.escaped) {
        message = "도망에 성공했습니다!";
      } else {
        message = `당신이 ${result.playerDamage}의 데미지를 주었습니다.\n`;
        if (result.monsterDamage > 0) {
          message += `몬스터가 ${result.monsterDamage}의 데미지를 주었습니다.\n`;
        }
        if (result.stageCleared) {
          message += "스테이지 클리어! 능력치가 상승했습니다.";
        }
      }
    }

    setGameState({
      message,
      lastAction: result,
    });
  };

  if (!game) return <div>Loading...</div>;

  return (
    <main className={styles.main}>
      <div className={styles.gameContainer}>
        <h1>로그라이크 게임</h1>

        <div className={styles.stats}>
          <div className={styles.playerStats}>
            <h2>플레이어 (Stage {game.player.stage})</h2>
            <p>
              HP: {game.player.hp}/{game.player.maxHp}
            </p>
            <p>
              공격력: {game.player.minAttack}-{game.player.maxAttack}
            </p>
            <p>연속공격 확률: {game.player.comboChance}%</p>
            <p>방어율: {game.player.defenseRate}%</p>
            <p>도망 확률: {game.player.escapeChance}%</p>
          </div>

          <div className={styles.monsterStats}>
            <h2>몬스터</h2>
            <p>HP: {game.monster.hp}</p>
            <p>공격력: {game.monster.attack}</p>
          </div>
        </div>

        <div className={styles.message}>{gameState.message}</div>

        <div className={styles.actions}>
          <button onClick={() => handleAction("attack")}>공격</button>
          <button onClick={() => handleAction("combo")}>연속공격</button>
          <button onClick={() => handleAction("defend")}>방어</button>
          <button onClick={() => handleAction("escape")}>도망</button>
        </div>
      </div>
    </main>
  );
}
