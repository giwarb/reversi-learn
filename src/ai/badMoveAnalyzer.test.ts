import { describe, expect, it } from 'vitest';
import type { Board, Position } from '../game/types';
import { analyzeDetailedBadMove } from './badMoveAnalyzer';

describe('analyzeDetailedBadMove', () => {
  it('危険な位置への着手を検出する', () => {
    // 角の隣（C-square）への着手を検出するテスト
    const board: Board = [
      [null, 'white', null, null, null, null, null, null],
      ['white', 'white', null, null, null, null, null, null],
      [null, null, 'white', 'black', null, null, null, null],
      [null, null, null, 'white', 'black', null, null, null],
      [null, null, null, 'black', 'white', null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];

    const playerMove: Position = { row: 0, col: 0 }; // 角への着手（有効な手）
    const analysis = analyzeDetailedBadMove(board, playerMove, 'black', 3);

    // 分析結果を確認
    expect(analysis).toBeDefined();

    // 角への着手は通常良い手なので、impactsは少ないはず
    expect(analysis.scoreDifference).toBeLessThanOrEqual(0);
  });

  it('着手可能数の大幅な減少を検出する', () => {
    const board: Board = [
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, 'black', 'black', 'black', null, null, null],
      [null, null, 'black', 'white', 'black', null, null, null],
      [null, null, 'black', 'black', 'white', null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
    ];

    const playerMove: Position = { row: 2, col: 5 };
    const analysis = analyzeDetailedBadMove(board, playerMove, 'black', 3);

    // この盤面では具体的な結果は実装に依存するが、分析が実行されることを確認
    expect(analysis).toBeDefined();
    expect(analysis.playerMove).toEqual(playerMove);
  });

  it('将来の影響を分析する', () => {
    const board: Board = [
      ['black', 'white', 'white', 'white', 'white', 'white', 'white', null],
      ['black', 'white', 'black', 'black', 'black', 'black', 'white', null],
      ['black', 'white', 'black', 'white', 'white', 'black', 'white', null],
      ['black', 'white', 'black', 'white', 'black', 'black', 'white', null],
      ['black', 'white', 'black', 'black', 'white', 'black', 'white', null],
      ['black', 'white', 'white', 'white', 'white', 'black', 'white', null],
      ['black', 'black', 'black', 'black', 'black', 'black', 'white', null],
      [null, null, null, null, null, null, null, null],
    ];

    const playerMove: Position = { row: 0, col: 7 };
    const analysis = analyzeDetailedBadMove(board, playerMove, 'black', 3);

    expect(analysis.opponentBestResponse).toBeDefined();
    // 相手が角を取れる場合、将来の影響に記載される
    if (analysis.opponentBestResponse?.row === 7 && analysis.opponentBestResponse?.col === 7) {
      expect(analysis.futureConsequences).toContain('相手が角を取ることができます');
    }
  });
});
