import { describe, expect, it } from 'vitest';
import { BadMoveDetector } from './badMoveDetector';
import { createInitialBoard } from './board';

describe('BadMoveDetector', () => {
  it('検出器のインスタンスを作成できる', () => {
    const detector = new BadMoveDetector(4, 50);
    expect(detector).toBeInstanceOf(BadMoveDetector);
  });

  it('有効な手を分析できる', () => {
    const detector = new BadMoveDetector(3, 50);
    const board = createInitialBoard();
    const result = detector.detectBadMove(board, { row: 2, col: 3 }, 'black', 'black');

    expect(result.isBadMove).toBeDefined();
    expect(result.playerMove).toEqual({ row: 2, col: 3 });
    expect(result.explanation).toBeTruthy();
  });

  it('無効な手を検出できる', () => {
    const detector = new BadMoveDetector(3, 50);
    const board = createInitialBoard();
    const result = detector.detectBadMove(board, { row: 0, col: 0 }, 'black', 'black');

    expect(result.isBadMove).toBe(false);
    expect(result.explanation).toContain('無効な手');
  });

  it('しきい値を設定・取得できる', () => {
    const detector = new BadMoveDetector(4, 50);

    expect(detector.getThreshold()).toBe(50);

    detector.setThreshold(75);
    expect(detector.getThreshold()).toBe(75);

    // 負の値は0になる
    detector.setThreshold(-10);
    expect(detector.getThreshold()).toBe(0);
  });

  it('AI深さを設定・取得できる', () => {
    const detector = new BadMoveDetector(4, 50);

    expect(detector.getAIDepth()).toBe(4);

    detector.setAIDepth(6);
    expect(detector.getAIDepth()).toBe(6);
  });

  it('同じ手を選んだ場合は悪手にならない', () => {
    const detector = new BadMoveDetector(1, 50); // 浅い探索で高速化
    const board = createInitialBoard();

    // AIが選ぶであろう手を事前に確認
    const result = detector.detectBadMove(board, { row: 2, col: 3 }, 'black', 'black');

    // AIの推奨手と同じかどうかで判定が変わる
    if (
      result.aiRecommendation &&
      result.aiRecommendation.row === 2 &&
      result.aiRecommendation.col === 3
    ) {
      expect(result.explanation).toContain('最善手を選びました');
    }
  });
});
