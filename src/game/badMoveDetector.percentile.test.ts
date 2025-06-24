import { describe, expect, it } from 'vitest';
import { createInitialBoard } from './board';
import { BadMoveDetector } from './badMoveDetector';
import { getAllValidMoves } from './rules';

describe('BadMoveDetector - パーセンタイルベース判定', () => {
  it('上位20%の手は悪手と判定されない', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(3); // 浅い探索で高速化

    // 初期状態での有効な手を取得
    const validMoves = getAllValidMoves(board, 'black');

    // すべての手を分析
    const results = validMoves.map((move) =>
      detector.detectBadMove(board, { row: move.row, col: move.col }, 'black')
    );

    // 順位でソート
    results.sort((a, b) => (a.rank || 0) - (b.rank || 0));

    // 上位20%の手を確認
    const top20PercentCount = Math.ceil(validMoves.length * 0.2);
    for (let i = 0; i < top20PercentCount; i++) {
      expect(results[i].isBadMove).toBe(false);
      expect(results[i].percentile).toBeGreaterThanOrEqual(80);
    }
  });

  it('下位80%の手は悪手と判定される', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(3);

    const validMoves = getAllValidMoves(board, 'black');
    const results = validMoves.map((move) =>
      detector.detectBadMove(board, { row: move.row, col: move.col }, 'black')
    );

    // パーセンタイルでソート
    results.sort((a, b) => (b.percentile || 0) - (a.percentile || 0));

    // 80パーセンタイル未満の手を確認
    const badMoves = results.filter((r) => r.percentile && r.percentile < 80);

    // 悪手が存在する場合のみテスト
    if (badMoves.length > 0) {
      badMoves.forEach((move) => {
        expect(move.isBadMove).toBe(true);
      });
    }

    // 少なくとも1つは悪手があることを確認（全部同率の場合を除く）
    const uniqueScores = new Set(results.map((r) => r.scoreDifference));
    if (uniqueScores.size > 1) {
      expect(badMoves.length).toBeGreaterThan(0);
    }
  });

  it('順位と総手数が正しく表示される', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(3);

    const validMoves = getAllValidMoves(board, 'black');
    const firstMove = validMoves[0];
    const result = detector.detectBadMove(
      board,
      { row: firstMove.row, col: firstMove.col },
      'black'
    );

    expect(result.rank).toBeDefined();
    expect(result.totalMoves).toBe(validMoves.length);
    expect(result.rank).toBeGreaterThanOrEqual(1);
    expect(result.rank).toBeLessThanOrEqual(validMoves.length);
  });

  it('パーセンタイルが正しく計算される', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(3);

    const validMoves = getAllValidMoves(board, 'black');
    const results = validMoves.map((move) =>
      detector.detectBadMove(board, { row: move.row, col: move.col }, 'black')
    );

    results.sort((a, b) => (a.rank || 0) - (b.rank || 0));

    // 最善手は100%
    expect(results[0].percentile).toBe(100);

    // 最悪手のパーセンタイルを確認
    const worstRank = Math.max(...results.map((r) => r.rank || 0));
    const worstMoves = results.filter((r) => r.rank === worstRank);

    // 同率最下位が複数ある場合を考慮
    const worstMove = worstMoves[0];
    const worstMoveCount = worstMoves.length;
    const expectedPercentile = (worstMoveCount / validMoves.length) * 100;

    // 最悪手のパーセンタイルは最低でも1手分の割合以上
    expect(worstMove.percentile).toBeGreaterThanOrEqual(expectedPercentile);
  });

  it('説明文に順位情報が含まれる', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(3);

    const validMoves = getAllValidMoves(board, 'black');
    const lastMove = validMoves[validMoves.length - 1];
    const result = detector.detectBadMove(board, { row: lastMove.row, col: lastMove.col }, 'black');

    expect(result.explanation).toContain('手中');
    expect(result.explanation).toContain('位');
    expect(result.explanation).toContain('上位');
    expect(result.explanation).toContain('%');
  });

  it('大悪手（下位20%）は特別な警告が表示される', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(3);

    const validMoves = getAllValidMoves(board, 'black');
    const results = validMoves.map((move) =>
      detector.detectBadMove(board, { row: move.row, col: move.col }, 'black')
    );

    // パーセンタイルが20%未満の手を見つける
    const terribleMove = results.find((r) => r.percentile && r.percentile < 20);

    if (terribleMove) {
      expect(terribleMove.explanation).toContain('大悪手');
    }
  });

  it('同率の手は同じ順位として扱われる', () => {
    const board = createInitialBoard();
    const detector = new BadMoveDetector(2); // より浅い探索で同率を作りやすくする

    const validMoves = getAllValidMoves(board, 'black');
    const results = validMoves.map((move) =>
      detector.detectBadMove(board, { row: move.row, col: move.col }, 'black')
    );

    // スコアでグループ化
    const scoreGroups = new Map<number, number>();
    results.forEach((r) => {
      const score = r.scoreDifference;
      scoreGroups.set(score, (scoreGroups.get(score) || 0) + 1);
    });

    // 同じスコアの手が複数ある場合
    const tiedScores = Array.from(scoreGroups.entries()).filter(([_, count]) => count > 1);

    if (tiedScores.length > 0) {
      // 同じスコアの手が同じ順位を持つことを確認
      const [tiedScore] = tiedScores[0];
      const tiedResults = results.filter((r) => r.scoreDifference === tiedScore);
      const ranks = tiedResults.map((r) => r.rank);

      // すべて同じ順位であることを確認
      expect(new Set(ranks).size).toBe(1);

      // 「位タイ」という表示があることを確認
      const tiedResult = tiedResults[0];
      if (tiedResult.isBadMove) {
        expect(tiedResult.explanation).toContain('位タイ');
      }
    }
  });
});
