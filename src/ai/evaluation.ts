import { countPieces } from '../game/board';
import { getAllValidMoves } from '../game/rules';
import type { Board } from '../game/types';

// 位置の重み（角が最も価値が高い）
const POSITION_WEIGHTS = [
  [100, -20, 10, 5, 5, 10, -20, 100],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [5, -2, -1, -1, -1, -1, -2, 5],
  [10, -2, -1, -1, -1, -1, -2, 10],
  [-20, -50, -2, -2, -2, -2, -50, -20],
  [100, -20, 10, 5, 5, 10, -20, 100],
];

export const evaluatePosition = (board: Board): number => {
  let score = 0;

  // 位置による評価（マイナス=黒有利、プラス=白有利）
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell === 'black') {
        score -= POSITION_WEIGHTS[row][col];
      } else if (cell === 'white') {
        score += POSITION_WEIGHTS[row][col];
      }
    }
  }

  return score;
};

export const evaluateMobility = (board: Board): number => {
  const blackMoves = getAllValidMoves(board, 'black');
  const whiteMoves = getAllValidMoves(board, 'white');

  if (blackMoves.length + whiteMoves.length !== 0) {
    return (
      (100 * (whiteMoves.length - blackMoves.length)) /
      (blackMoves.length + whiteMoves.length)
    );
  }

  return 0;
};

export const evaluatePieceCount = (board: Board): number => {
  const counts = countPieces(board);

  if (counts.black + counts.white !== 0) {
    return (100 * (counts.white - counts.black)) / (counts.black + counts.white);
  }

  return 0;
};

export const evaluateBoard = (board: Board): number => {
  const counts = countPieces(board);
  const totalPieces = counts.black + counts.white;

  // ゲームの進行度に応じて評価の重みを変える（マイナス=黒有利、プラス=白有利）
  if (totalPieces < 20) {
    // 序盤：位置と着手可能数を重視
    return evaluatePosition(board) + evaluateMobility(board) * 2;
  } else if (totalPieces < 40) {
    // 中盤：バランスよく評価
    return (
      evaluatePosition(board) +
      evaluateMobility(board) +
      evaluatePieceCount(board) * 0.5
    );
  } else {
    // 終盤：石の数を重視
    return (
      evaluatePosition(board) * 0.5 +
      evaluateMobility(board) * 0.5 +
      evaluatePieceCount(board) * 2
    );
  }
};
