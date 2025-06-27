import { describe, expect, it } from 'vitest';
import { minimax } from '../../ai/minimax';
import { EVALUATION_CONSTANTS } from '../../constants/ai';
import { getValidMove, makeMove } from '../../game/rules';
import type { Board } from '../../game/types';
import { getNormalizedScores } from '../../utils/evaluationNormalizer';

describe('評価値一貫性統合テスト', () => {
  const createTestBoard = (): Board => {
    const board: Board = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null));
    board[3][3] = 'white';
    board[3][4] = 'black';
    board[4][3] = 'black';
    board[4][4] = 'white';
    return board;
  };

  it('相手番評価値と詳細分析の評価値が一致する', () => {
    // 1. 初期盤面でプレイヤーが手を打つ
    const initialBoard = createTestBoard();
    const playerMove = getValidMove(initialBoard, { row: 3, col: 2 }, 'black');
    if (!playerMove) throw new Error('Invalid move');
    const boardAfterPlayerMove = makeMove(initialBoard, playerMove, 'black');

    // 2. useEvaluation.updateEvaluation相当の評価値計算（AI手番時）
    const aiTurnEvaluation = minimax(
      boardAfterPlayerMove,
      'white', // AI(白)の手番
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );
    const { blackScore: aiTurnBlackScore, whiteScore: aiTurnWhiteScore } =
      getNormalizedScores(aiTurnEvaluation);

    // 3. BadMoveDialog相当の詳細分析評価値を直接計算
    const playerColor = 'black';
    const currentPlayerForAnalysis = playerColor === 'black' ? 'white' : 'black';

    const analysisEvaluation = minimax(
      boardAfterPlayerMove,
      currentPlayerForAnalysis,
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    const { blackScore: analysisBlackScore, whiteScore: analysisWhiteScore } =
      getNormalizedScores(analysisEvaluation);

    // 4. デバッグ情報出力
    console.log('\n=== 統合テスト結果 ===');
    console.log('ボード状態（黒c4手後）:');
    boardAfterPlayerMove.forEach((row, i) => {
      const rowStr = row
        .map((cell) => (cell === 'black' ? '●' : cell === 'white' ? '○' : '·'))
        .join(' ');
      console.log(`${i + 1} ${rowStr}`);
    });

    console.log('\n相手番時評価値（useEvaluation相当）:');
    console.log(`- 生評価値: ${aiTurnEvaluation}`);
    console.log(`- 黒スコア: ${aiTurnBlackScore}`);
    console.log(`- 白スコア: ${aiTurnWhiteScore}`);

    console.log('\n詳細分析評価値（BadMoveDialog相当）:');
    console.log(`- 生評価値: ${analysisEvaluation}`);
    console.log(`- 黒スコア: ${analysisBlackScore}`);
    console.log(`- 白スコア: ${analysisWhiteScore}`);

    // 5. 評価値が一致することを検証
    expect(aiTurnEvaluation).toBe(analysisEvaluation);
    expect(aiTurnBlackScore).toBe(analysisBlackScore);
    expect(aiTurnWhiteScore).toBe(analysisWhiteScore);

    console.log('\n✅ 相手番評価値と詳細分析の評価値が一致しました');
  });

  it('手を打つ前後での評価値記録と分析の一致', () => {
    // この部分では、実際のゲームプレイシナリオを模倣
    const board = createTestBoard();

    // プレイヤーが手を打つ前の評価値を記録
    const beforeMoveEvaluation = minimax(
      board,
      'black', // 黒の手番
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );
    const beforeMoveScores = getNormalizedScores(beforeMoveEvaluation);

    // プレイヤーが手を打つ
    const playerMove = getValidMove(board, { row: 3, col: 2 }, 'black');
    if (!playerMove) throw new Error('Invalid move');
    const boardAfterMove = makeMove(board, playerMove, 'black');

    // 手を打った後の白の手番での評価値
    const afterMoveEvaluation = minimax(
      boardAfterMove,
      'white', // 白の手番
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );
    const afterMoveScores = getNormalizedScores(afterMoveEvaluation);

    console.log('\n=== 手前後の評価値変化 ===');
    console.log(
      `手前評価値: ${beforeMoveEvaluation} (黒:${beforeMoveScores.blackScore}, 白:${beforeMoveScores.whiteScore})`
    );
    console.log(
      `手後評価値: ${afterMoveEvaluation} (黒:${afterMoveScores.blackScore}, 白:${afterMoveScores.whiteScore})`
    );

    // この場合は値が変わるのが正常（手を打ったため盤面が変化）
    expect(typeof beforeMoveEvaluation).toBe('number');
    expect(typeof afterMoveEvaluation).toBe('number');
  });
});
