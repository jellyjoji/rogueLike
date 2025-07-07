"use client";

import { useState, useEffect } from "react";
import styles from "./page.module.css";
import { GameController } from "../game/GameController";

const UI_TEXT = {
  ko: {
    title: "로그라이크 게임",
    player: "플레이어",
    monster: "몬스터",
    stage: "스테이지",
    hp: "HP",
    attack: "공격력",
    comboChance: "연속공격 확률",
    defenseRate: "방어율",
    escapeChance: "도망 확률",
    actions: ["공격", "연속공격", "방어", "도망"],
    loading: "로딩 중...",
    selectLang: "언어 선택",
    gameOver: "게임 오버! 새 게임을 시작하세요.",
    escapeSuccess: "도망에 성공했습니다!",
    stageClear: "스테이지 클리어! 능력치가 상승했습니다.",
    playerAttack: (dmg) => `당신이 ${dmg}의 데미지를 주었습니다.`,
    monsterAttack: (dmg) => `몬스터가 ${dmg}의 데미지를 주었습니다.`,
  },
  en: {
    title: "Roguelike Game",
    player: "Player",
    monster: "Monster",
    stage: "Stage",
    hp: "HP",
    attack: "Attack",
    comboChance: "Combo Chance",
    defenseRate: "Defense Rate",
    escapeChance: "Escape Chance",
    actions: ["Attack", "Combo", "Defend", "Escape"],
    loading: "Loading...",
    selectLang: "Select Language",
    gameOver: "Game Over! Start a new game.",
    escapeSuccess: "Escaped successfully!",
    stageClear: "Stage clear! Stat increased.",
    playerAttack: (dmg) => `You dealt ${dmg} damage.`,
    monsterAttack: (dmg) => `Monster dealt ${dmg} damage.`,
  },
};

export default function Home() {
  const [language, setLanguage] = useState("ko");
  const [game, setGame] = useState(null);
  const [gameState, setGameState] = useState({
    message: "",
    lastAction: null,
  });
  const t = UI_TEXT[language];

  useEffect(() => {
    setGame(new GameController(language));
  }, [language]);

  const handleAction = (action) => {
    if (!game) return;
    if (game.language !== language) game.setLanguage(language);
    const result = game.performAction(action);
    let message = "";
    if (result.gameOver) {
      message = t.gameOver;
      setGame(new GameController(language));
    } else {
      if (result.escaped) {
        message = t.escapeSuccess;
      } else {
        message = t.playerAttack(result.playerDamage) + "\n";
        if (result.monsterDamage > 0) {
          message += t.monsterAttack(result.monsterDamage) + "\n";
        }
        if (result.stageCleared) {
          message += t.stageClear;
        }
      }
      if (result.specialEffects && result.specialEffects.length > 0) {
        message += "\n" + result.specialEffects.join("\n");
      }
    }
    setGameState({
      message,
      lastAction: result,
    });
  };

  if (!game) return <div>{t.loading}</div>;

  return (
    <main className={styles.main}>
      <div className={styles.gameContainer}>
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginBottom: 8,
          }}
        >
          <label htmlFor="lang-select" style={{ marginRight: 8 }}>
            {t.selectLang}:
          </label>
          <select
            id="lang-select"
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="ko">한국어</option>
            <option value="en">English</option>
          </select>
        </div>
        <h1>{t.title}</h1>
        <div className={styles.stats}>
          <div className={styles.playerStats}>
            <h2>
              {t.player} ({t.stage} {game.player.stage})
            </h2>
            <p>
              {t.hp}: {game.player.hp}/{game.player.maxHp}
            </p>
            <p>
              {t.attack}: {game.player.minAttack}-{game.player.maxAttack}
            </p>
            <p>
              {t.comboChance}: {game.player.comboChance}%
            </p>
            <p>
              {t.defenseRate}: {game.player.defenseRate}%
            </p>
            <p>
              {t.escapeChance}: {game.player.escapeChance}%
            </p>
          </div>
          <div className={styles.monsterStats}>
            <h2>{t.monster}</h2>
            <p>
              {t.hp}: {game.monster.hp}
            </p>
            <p>
              {t.attack}: {game.monster.attack}
            </p>
          </div>
        </div>
        <div className={styles.message}>{gameState.message}</div>
        <div className={styles.actions}>
          <button onClick={() => handleAction("attack")}>{t.actions[0]}</button>
          <button onClick={() => handleAction("combo")}>{t.actions[1]}</button>
          <button onClick={() => handleAction("defend")}>{t.actions[2]}</button>
          <button onClick={() => handleAction("escape")}>{t.actions[3]}</button>
        </div>
      </div>
    </main>
  );
}
