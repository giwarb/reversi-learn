import { checkGameOver } from '../game/gameState';
import { getAllValidMoves, getOpponent, makeMove } from '../game/rules';
import type { Board, GameState, Player } from '../game/types';
import { evaluateBoard } from './evaluation';
import type { MoveEvaluation } from './types';

const MAX_SCORE = 1000000;
const MIN_SCORE = -1000000;

export const minimax = (
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  originalPlayer: Player
): number => {
  // 深さ0または終了状態なら評価値を返す
  if (depth === 0) {
    return evaluateBoard(board, originalPlayer);
  }

  const validMoves = getAllValidMoves(board, player);

  // 有効な手がない場合
  if (validMoves.length === 0) {
    const opponent = getOpponent(player);
    const opponentMoves = getAllValidMoves(board, opponent);

    // 相手も打てない場合はゲーム終了
    if (opponentMoves.length === 0) {
      const tempState: GameState = {
        board,
        currentPlayer: player,
        gameOver: false,
        winner: null,
        moveHistory: [],
      };
      const finalState = checkGameOver(tempState);

      if (finalState.winner === originalPlayer) {
        return MAX_SCORE - (10 - depth);
      } else if (finalState.winner === getOpponent(originalPlayer)) {
        return MIN_SCORE + (10 - depth);
      } else {
        return 0;
      }
    }

    // パスの場合
    return minimax(board, opponent, depth, alpha, beta, !maximizingPlayer, originalPlayer);
  }

  if (maximizingPlayer) {
    let maxEval = MIN_SCORE;

    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player);
      const evaluation = minimax(
        newBoard,
        getOpponent(player),
        depth - 1,
        alpha,
        beta,
        false,
        originalPlayer
      );

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);

      if (beta <= alpha) {
        break; // ベータカット
      }
    }

    return maxEval;
  } else {
    let minEval = MAX_SCORE;

    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player);
      const evaluation = minimax(
        newBoard,
        getOpponent(player),
        depth - 1,
        alpha,
        beta,
        true,
        originalPlayer
      );

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      if (beta <= alpha) {
        break; // アルファカット
      }
    }

    return minEval;
  }
};

export const findBestMove = (
  board: Board,
  player: Player,
  maxDepth: number
): MoveEvaluation | null => {
  const validMoves = getAllValidMoves(board, player);

  if (validMoves.length === 0) {
    return null;
  }

  let bestMove: MoveEvaluation | null = null;
  let bestScore = MIN_SCORE;

  for (const move of validMoves) {
    const newBoard = makeMove(board, move, player);
    const score = minimax(
      newBoard,
      getOpponent(player),
      maxDepth - 1,
      MIN_SCORE,
      MAX_SCORE,
      false,
      player
    );

    if (score > bestScore) {
      bestScore = score;
      bestMove = {
        position: { row: move.row, col: move.col },
        score,
        depth: maxDepth,
      };
    }
  }

  return bestMove;
};
