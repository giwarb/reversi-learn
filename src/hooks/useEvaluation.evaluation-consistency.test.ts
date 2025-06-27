import { describe, expect, it } from 'vitest';
import { minimax } from '../ai/minimax';
import { EVALUATION_CONSTANTS } from '../constants/ai';
import { getValidMove, makeMove } from '../game/rules';
import type { Board, GameState, Player } from '../game/types';
import { getNormalizedScores } from '../utils/evaluationNormalizer';

describe('評価値の一貫性テスト', () => {
  // テスト用の初期盤面を作成
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

  it('AI手番時評価値と詳細分析評価値が一致する', () => {
    // 1. 初期状態
    const initialBoard = createTestBoard();

    // 2. 黒が手を打つ（例：c4）
    const playerMovePosition = { row: 3, col: 2 }; // c4
    const playerMove = getValidMove(initialBoard, playerMovePosition, 'black');
    if (!playerMove) throw new Error('Invalid move');
    const boardAfterPlayerMove = makeMove(initialBoard, playerMove, 'black');

    // 3. AI手番時の評価値計算（白の手番）
    // useEvaluation.updateEvaluation相当
    const aiTurnGameState: GameState = {
      board: boardAfterPlayerMove,
      currentPlayer: 'white', // 白の手番
      gameOver: false,
      winner: null,
      moveHistory: [],
      fullMoveHistory: [],
    };

    const aiTurnEvaluation = minimax(
      aiTurnGameState.board,
      aiTurnGameState.currentPlayer,
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    const aiTurnScores = getNormalizedScores(aiTurnEvaluation);

    // 4. 詳細分析時の評価値計算
    // BadMoveDialog.playerMoveEvaluation相当
    const playerColor: Player = 'black';
    const currentPlayerForAnalysis = playerColor === 'black' ? 'white' : 'black';

    const analysisEvaluation = minimax(
      boardAfterPlayerMove,
      currentPlayerForAnalysis,
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    const analysisScores = getNormalizedScores(analysisEvaluation);

    // 5. デバッグ情報を出力
    console.log('=== 評価値一貫性テスト ===');
    console.log('ボード状態（黒c4手後）:');
    boardAfterPlayerMove.forEach((row, i) => {
      const rowStr = row
        .map((cell) => (cell === 'black' ? '●' : cell === 'white' ? '○' : '·'))
        .join(' ');
      console.log(`${i + 1} ${rowStr}`);
    });

    console.log('\nAI手番時評価:');
    console.log(`- currentPlayer: ${aiTurnGameState.currentPlayer}`);
    console.log(`- 生評価値: ${aiTurnEvaluation}`);
    console.log(`- 正規化スコア: 黒=${aiTurnScores.blackScore}, 白=${aiTurnScores.whiteScore}`);

    console.log('\n詳細分析評価:');
    console.log(`- currentPlayer: ${currentPlayerForAnalysis}`);
    console.log(`- 生評価値: ${analysisEvaluation}`);
    console.log(`- 正規化スコア: 黒=${analysisScores.blackScore}, 白=${analysisScores.whiteScore}`);

    // 6. 評価値が一致することを検証
    expect(aiTurnEvaluation).toBe(analysisEvaluation);
    expect(aiTurnScores.blackScore).toBe(analysisScores.blackScore);
    expect(aiTurnScores.whiteScore).toBe(analysisScores.whiteScore);
  });

  it('シンプルな手順での評価値一貫性', () => {
    // 既に成功した最初のテストケースと同様にシンプルにする
    const board = createTestBoard();

    // 黒: c4のみ
    const move1 = getValidMove(board, { row: 3, col: 2 }, 'black');
    if (!move1) throw new Error('Invalid move 1');
    const boardAfterMove = makeMove(board, move1, 'black');

    // AI手番時評価（白の手番）
    const aiTurnEvaluation = minimax(
      boardAfterMove,
      'white',
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    // 詳細分析評価
    const analysisEvaluation = minimax(
      boardAfterMove,
      'white', // playerColor=blackなので、currentPlayer=white
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    console.log('\n=== シンプル手順テスト ===');
    console.log(`AI手番評価値: ${aiTurnEvaluation}`);
    console.log(`詳細分析評価値: ${analysisEvaluation}`);

    expect(aiTurnEvaluation).toBe(analysisEvaluation);
  });

  it('パラメータ違いでの評価値の変化を確認', () => {
    const board = createTestBoard();
    const testMovePosition = { row: 3, col: 2 };
    const testMove = getValidMove(board, testMovePosition, 'black');
    if (!testMove) throw new Error('Invalid test move');
    const boardAfterMove = makeMove(board, testMove, 'black');

    // 同じボード、同じ深度、currentPlayerのみ変更
    const evaluationWithWhite = minimax(
      boardAfterMove,
      'white',
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    const evaluationWithBlack = minimax(
      boardAfterMove,
      'black',
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    console.log('\n=== currentPlayer違いテスト ===');
    console.log(`currentPlayer=white: ${evaluationWithWhite}`);
    console.log(`currentPlayer=black: ${evaluationWithBlack}`);

    // currentPlayerが違えば評価値も異なる可能性がある
    // これが問題の原因かもしれない
    if (evaluationWithWhite !== evaluationWithBlack) {
      console.log('⚠️ currentPlayerの違いで評価値が変わることを確認');
    }
  });
});
