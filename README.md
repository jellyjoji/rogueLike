# [Node.js] Rogue like JAVASCRIPT! 과제

## **개발 프로세스 가이드**

### **0단계 : 게임 기획 분석**

**전투 기획**

1. 플레이어에게는 여러 가지 선택지가 주어진다.
   (공격, 연속공격, 방어, 도망 등…) 1. 공격 - 100% 확률로 공격 성공, 몬스터에게 피격 2. 연속공격 - 일정 확률로 2번 공격 성공, 몬스터에게 피격 3. 방어 - 일정확률로 방어 성공, 몬스터에게 60%의 공격력으로 반격 4. 도망 - 일정 확률로 해당 스테이지 클리어
2. 플레이어의 공격력은 최소공격력과 최대공격력이 존재하며, 최소공격력은 정수이고 최대공격력은 플레이어가 가지고 있는 최대 공격력 배율에 따라 달라진다.
3. 스테이지 클리어 시, 아래의 능력치 중 하나가 정해진 수치내에서 랜덤으로 증가한다. 증가하는 능력치는 아래와 같다.
   - 체력 20~50
   - 최소 공격력 5~20
   - 최대 공격력 배율 (0.1 ~ 1)
   - 도망 확률 1~3
   - 연속 공격 확률 3~7
   - 방어 수치 3~10
4. 스테이지 클리어 시, 체력이 일정수치 회복된다.
5. 기본 전투형태는 턴제 형식으로 진행된다.
6. 스테이지가 진행될 수록 몬스터의 체력과 공격력도 강해진다.

**도전 기능 가이드**

1. 확률 로직 개선:

연속 공격: 이전에 연속 공격 성공시 확률 증가
방어: 연속으로 방어할수록 확률 감소 (밸런스)
도망: HP가 낮을수록 확률 증가
몬스터 스탯: 스테이지별 랜덤 변동폭 추가 (80%~120%)

2. 복잡한 행동 패턴:

연속 공격:
성공 시 연속 공격 스트릭 증가
스트릭 3 이상시 3연속 공격 가능
방어:
연속 방어 성공시 반격 데미지 증가
3연속 방어시 "완벽한 방어" 효과
일반 공격:
10% 확률로 치명타 (1.5배 데미지)

3. 몬스터 AI 개선:

분노 시스템: HP가 낮을수록 공격력 증가
연속 공격 시스템: 공격 성공시 다음 공격이 강화됨
특수 공격: 20% 확률로 1.5배 데미지
공격 실패 시스템: 30% 확률로 공격 실패

4. 전투 결과 표시 개선:

특수 효과 메시지 추가 (치명타, 연속 공격, 완벽한 방어 등)
스탯 증가량 상세 표시
몬스터의 특수 행동 표시

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.
