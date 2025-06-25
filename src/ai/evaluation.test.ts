import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';
import {
  evaluateBoard,
  evaluateMobility,
  evaluatePieceCount,
  evaluatePosition,
} from './evaluation';

describe('evaluatePosition', () => {
  it('黒が角を占めるとマイナス評価（黒有利）', () => {
    const board = createInitialBoard();
    board[0][0] = 'black';
    board[0][7] = 'black';

    const score = evaluatePosition(board);
    expect(score).toBeLessThan(0); // 黒有利=マイナス
  });

  it('白が角を占めるとプラス評価（白有利）', () => {
    const board = createInitialBoard();
    board[0][0] = 'white';
    board[0][7] = 'white';

    const score = evaluatePosition(board);
    expect(score).toBeGreaterThan(0); // 白有利=プラス
  });
});

describe('evaluateMobility', () => {
  it('初期状態では着手可能数が同じなので評価は0', () => {
    const board = createInitialBoard();
    const score = evaluateMobility(board);

    // 初期状態では黒と白の着手可能数は同じ
    expect(score).toBe(0);
  });
});

describe('evaluatePieceCount', () => {
  it('黒の石が多いとマイナス評価（黒有利）', () => {
    const board = createInitialBoard();
    board[0][0] = 'black';
    board[0][1] = 'black';

    const score = evaluatePieceCount(board);
    expect(score).toBeLessThan(0); // 黒有利=マイナス
  });
});

describe('evaluateBoard', () => {
  it('総合的な評価を返す', () => {
    const board = createInitialBoard();
    const score = evaluateBoard(board);

    expect(typeof score).toBe('number');
  });
});
