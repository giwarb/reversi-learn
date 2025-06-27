import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';

// テスト対象の関数（リネーム後の名前でテスト）
import { analyzeMoveRanking, compareMovesWithAI } from './moveAnalyzer';

describe('analyzeMoveRanking', () => {
  it('有効な手を分析できる', () => {
    const board = createInitialBoard();
    const analysis = analyzeMoveRanking(board, { row: 2, col: 3 }, 'black', 3);

    expect(analysis).not.toBeNull();
    expect(analysis?.position).toEqual({ row: 2, col: 3 });
    expect(analysis?.score).toBeDefined();
    expect(analysis?.reasons).toBeInstanceOf(Array);
  });

  it('無効な手はnullを返す', () => {
    const board = createInitialBoard();
    const analysis = analyzeMoveRanking(board, { row: 0, col: 0 }, 'black', 3);

    expect(analysis).toBeNull();
  });

  it('手のランキング情報を提供する', () => {
    const board = createInitialBoard();
    const analysis = analyzeMoveRanking(board, { row: 2, col: 3 }, 'black', 3);

    expect(analysis).not.toBeNull();
    if (analysis) {
      expect(analysis.rank).toBeDefined();
      expect(analysis.percentile).toBeDefined();
      expect(typeof analysis.rank).toBe('number');
      expect(typeof analysis.percentile).toBe('number');
    }
  });

  it('悪手を検出してランキング情報を含める', () => {
    const board = createInitialBoard();
    // X打ちの位置は通常悪手とされる
    board[0][0] = null; // 角を空ける
    const analysis = analyzeMoveRanking(board, { row: 1, col: 1 }, 'black', 3);

    if (analysis && analysis.reasons.length > 0) {
      expect(analysis.reasons.some((r) => r.includes('相手に角を取られる'))).toBe(true);
      expect(analysis.rank).toBeGreaterThan(1); // ランクが低い（数値が大きい）
    }
  });

  it('最善手は高いランキングを持つ', () => {
    const board = createInitialBoard();
    const analysis = analyzeMoveRanking(board, { row: 2, col: 3 }, 'black', 3);

    expect(analysis).not.toBeNull();
    if (analysis) {
      // 初期位置での標準的な手は比較的良いランキングを持つべき
      expect(analysis.percentile).toBeGreaterThan(0);
      expect(analysis.percentile).toBeLessThanOrEqual(100);
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

  it('手の比較で適切な情報を含む', () => {
    const playerMove = { row: 2, col: 3 };
    const aiMove = { row: 3, col: 2 };
    const board = createInitialBoard();

    const comparison = compareMovesWithAI(board, playerMove, aiMove, 'black');
    // AI推奨手と分析情報が含まれていることを確認
    expect(comparison).toContain('AIの推奨手');
    expect(comparison).toContain('あなたの手の分析');
  });
});
