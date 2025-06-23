import { countPieces } from '../game/board';
import { getAllValidMoves, getOpponent } from '../game/rules';
import type { Board, Player } from '../game/types';

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

export const evaluatePosition = (board: Board, player: Player): number => {
  let score = 0;

  // 位置による評価
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const cell = board[row][col];
      if (cell === player) {
        score += POSITION_WEIGHTS[row][col];
      } else if (cell === getOpponent(player)) {
        score -= POSITION_WEIGHTS[row][col];
      }
    }
  }

  return score;
};

export const evaluateMobility = (board: Board, player: Player): number => {
  const playerMoves = getAllValidMoves(board, player);
  const opponentMoves = getAllValidMoves(board, getOpponent(player));

  if (playerMoves.length + opponentMoves.length !== 0) {
    return (
      (100 * (playerMoves.length - opponentMoves.length)) /
      (playerMoves.length + opponentMoves.length)
    );
  }

  return 0;
};

export const evaluatePieceCount = (board: Board, player: Player): number => {
  const counts = countPieces(board);
  const playerCount = player === 'black' ? counts.black : counts.white;
  const opponentCount = player === 'black' ? counts.white : counts.black;

  if (playerCount + opponentCount !== 0) {
    return (100 * (playerCount - opponentCount)) / (playerCount + opponentCount);
  }

  return 0;
};

export const evaluateBoard = (board: Board, player: Player): number => {
  const counts = countPieces(board);
  const totalPieces = counts.black + counts.white;

  // ゲームの進行度に応じて評価の重みを変える
  if (totalPieces < 20) {
    // 序盤：位置と着手可能数を重視
    return evaluatePosition(board, player) + evaluateMobility(board, player) * 2;
  } else if (totalPieces < 40) {
    // 中盤：バランスよく評価
    return (
      evaluatePosition(board, player) +
      evaluateMobility(board, player) +
      evaluatePieceCount(board, player) * 0.5
    );
  } else {
    // 終盤：石の数を重視
    return (
      evaluatePosition(board, player) * 0.5 +
      evaluateMobility(board, player) * 0.5 +
      evaluatePieceCount(board, player) * 2
    );
  }
};
