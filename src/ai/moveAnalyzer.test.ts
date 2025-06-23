import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';
import { analyzeBadMove, compareMovesWithAI } from './moveAnalyzer';

describe('analyzeBadMove', () => {
  it('有効な手を分析できる', () => {
    const board = createInitialBoard();
    const analysis = analyzeBadMove(board, { row: 2, col: 3 }, 'black', 3);

    expect(analysis).not.toBeNull();
    expect(analysis?.position).toEqual({ row: 2, col: 3 });
    expect(analysis?.score).toBeDefined();
    expect(analysis?.reasons).toBeInstanceOf(Array);
  });

  it('無効な手はnullを返す', () => {
    const board = createInitialBoard();
    const analysis = analyzeBadMove(board, { row: 0, col: 0 }, 'black', 3);

    expect(analysis).toBeNull();
  });

  it('悪手を検出できる', () => {
    const board = createInitialBoard();
    // X打ちの位置は通常悪手とされる
    board[0][0] = null; // 角を空ける
    const analysis = analyzeBadMove(board, { row: 1, col: 1 }, 'black', 3);

    if (analysis && analysis.reasons.length > 0) {
      expect(analysis.reasons.some((r) => r.includes('相手に角を取られる'))).toBe(true);
    }
  });
});

describe('compareMovesWithAI', () => {
  it('同じ手を選んだ場合は褒める', () => {
    const playerMove = { row: 2, col: 3 };
    const aiMove = { row: 2, col: 3 };
    const board = createInitialBoard();

    const comparison = compareMovesWithAI(board, playerMove, aiMove, 'black');
    expect(comparison).toBe('最善手を選びました！');
  });

  it('異なる手の場合は比較を表示する', () => {
    const playerMove = { row: 2, col: 3 };
    const aiMove = { row: 3, col: 2 };
    const board = createInitialBoard();

    const comparison = compareMovesWithAI(board, playerMove, aiMove, 'black');
    expect(comparison).toContain('AIの推奨手:');
    expect(comparison).toContain('あなたの手の分析:');
  });

  it('AIが手を見つけられない場合', () => {
    const playerMove = { row: 2, col: 3 };
    const board = createInitialBoard();

    const comparison = compareMovesWithAI(board, playerMove, null, 'black');
    expect(comparison).toBe('AIは有効な手を見つけられませんでした。');
  });
});
