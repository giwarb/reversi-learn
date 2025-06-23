import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';
import {
  evaluateBoard,
  evaluateMobility,
  evaluatePieceCount,
  evaluatePosition,
} from './evaluation';

describe('evaluatePosition', () => {
  it('角を占めると高い評価を得る', () => {
    const board = createInitialBoard();
    board[0][0] = 'black';
    board[0][7] = 'black';

    const score = evaluatePosition(board, 'black');
    expect(score).toBeGreaterThan(0);
  });

  it('相手が角を占めると低い評価になる', () => {
    const board = createInitialBoard();
    board[0][0] = 'white';
    board[0][7] = 'white';

    const score = evaluatePosition(board, 'black');
    expect(score).toBeLessThan(0);
  });
});

describe('evaluateMobility', () => {
  it('着手可能数が多いと高い評価を得る', () => {
    const board = createInitialBoard();
    const score = evaluateMobility(board, 'black');

    // 初期状態では黒と白の着手可能数は同じ
    expect(score).toBe(0);
  });
});

describe('evaluatePieceCount', () => {
  it('石の数が多いと高い評価を得る', () => {
    const board = createInitialBoard();
    board[0][0] = 'black';
    board[0][1] = 'black';

    const score = evaluatePieceCount(board, 'black');
    expect(score).toBeGreaterThan(0);
  });
});

describe('evaluateBoard', () => {
  it('総合的な評価を返す', () => {
    const board = createInitialBoard();
    const score = evaluateBoard(board, 'black');

    expect(typeof score).toBe('number');
  });
});
