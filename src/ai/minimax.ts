import { AI_CONSTANTS, EVALUATION_CONSTANTS } from '../constants/ai';
import { checkGameOver } from '../game/gameState';
import { getAllValidMoves, getOpponent, getValidMove, makeMove } from '../game/rules';
import type { Board, GameState, Player, Position } from '../game/types';
import { createEvaluationScore } from '../game/types';
import { globalBoardCache } from './cache/boardCache';
import { evaluateBoard } from './evaluation';
import { compareMovesByPriority } from './moveOrdering';
import type { MoveEvaluation } from './types';

const { MAX_SCORE, MIN_SCORE } = EVALUATION_CONSTANTS;

export const minimax = (
  board: Board,
  player: Player,
  depth: number,
  alpha: number,
  beta: number
): number => {
  // Base case: return evaluation at depth 0
  if (depth === 0) {
    return evaluateBoard(board) as number;
  }

  const validMoves = getAllValidMoves(board, player);

  // No valid moves available
  if (validMoves.length === 0) {
    const opponent = getOpponent(player);
    const opponentMoves = getAllValidMoves(board, opponent);

    // If opponent also has no moves, game is over
    if (opponentMoves.length === 0) {
      const tempState: GameState = {
        board,
        currentPlayer: player,
        gameOver: false,
        winner: null,
        moveHistory: [],
        fullMoveHistory: [],
      };
      const finalState = checkGameOver(tempState);

      if (finalState.winner === 'black') {
        return MIN_SCORE + (10 - depth);
      } else if (finalState.winner === 'white') {
        return MAX_SCORE - (10 - depth);
      } else {
        return 0;
      }
    }

    // Pass turn to opponent
    return minimax(board, opponent, depth, alpha, beta);
  }

  // Minimax algorithm: black minimizes, white maximizes
  if (player === 'white') {
    // White player: maximize score
    let maxEval = MIN_SCORE;

    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player);
      const evaluation = minimax(newBoard, getOpponent(player), depth - 1, alpha, beta);

      maxEval = Math.max(maxEval, evaluation);
      alpha = Math.max(alpha, evaluation);

      if (beta <= alpha) {
        break; // Beta cutoff
      }
    }

    return maxEval;
  } else {
    // Black player: minimize score
    let minEval = MAX_SCORE;

    for (const move of validMoves) {
      const newBoard = makeMove(board, move, player);
      const evaluation = minimax(newBoard, getOpponent(player), depth - 1, alpha, beta);

      minEval = Math.min(minEval, evaluation);
      beta = Math.min(beta, evaluation);

      if (beta <= alpha) {
        break; // Alpha cutoff
      }
    }

    return minEval;
  }
};

export const findBestMoveIterativeDeepening = (
  board: Board,
  player: Player,
  maxDepth: number,
  timeLimitMs: number = AI_CONSTANTS.DEFAULT_TIME_LIMIT_MS
): MoveEvaluation | null => {
  const startTime = Date.now();
  let bestMoveAtDepth: MoveEvaluation | null = null;
  let previousBestMove: Position | null = null;
  const pv: Position[] = [];

  // Iterative deepening: search from depth 1 to maxDepth
  for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
    const depthStartTime = Date.now();

    // Time check: stop if remaining time is less than 2x previous search time
    const elapsedTime = depthStartTime - startTime;
    const remainingTime = timeLimitMs - elapsedTime;

    if (currentDepth > 1 && remainingTime < (depthStartTime - startTime) * 2) {
      break;
    }

    const validMoves = getAllValidMoves(board, player);
    if (validMoves.length === 0) {
      return null;
    }

    // Move ordering: search previous best move first
    const orderedMoves = orderMoves(validMoves, previousBestMove);

    let bestMove: MoveEvaluation | null = null;
    let bestScore = player === 'black' ? MAX_SCORE : MIN_SCORE;
    let alpha = MIN_SCORE;
    let beta = MAX_SCORE;

    for (const move of orderedMoves) {
      // 時間制限チェック
      if (Date.now() - startTime > timeLimitMs) {
        return bestMoveAtDepth; // 前の深さの結果を返す
      }

      const validMove = getValidMove(board, move, player);
      if (!validMove) continue;
      const newBoard = makeMove(board, validMove, player);
      const score = minimax(newBoard, getOpponent(player), currentDepth - 1, alpha, beta);

      if (player === 'black' && score < bestScore) {
        bestScore = score;
        bestMove = {
          position: { row: move.row, col: move.col },
          score: createEvaluationScore(score),
          depth: currentDepth,
          timeSpent: Date.now() - startTime,
        };
        beta = Math.min(beta, score);
      } else if (player === 'white' && score > bestScore) {
        bestScore = score;
        bestMove = {
          position: { row: move.row, col: move.col },
          score: createEvaluationScore(score),
          depth: currentDepth,
          timeSpent: Date.now() - startTime,
        };
        alpha = Math.max(alpha, score);
      }
    }

    if (bestMove) {
      bestMoveAtDepth = bestMove;
      previousBestMove = bestMove.position;
      pv[0] = bestMove.position;
      bestMoveAtDepth.pv = [...pv];
    }

    // キャッシュに保存
    if (bestMoveAtDepth) {
      globalBoardCache.set(board, bestScore, bestMoveAtDepth.position, currentDepth, player, true);
    }
  }

  return bestMoveAtDepth;
};

// ムーブオーダリング関数
const orderMoves = (moves: Position[], previousBest: Position | null): Position[] => {
  return [...moves].sort((a, b) => compareMovesByPriority(a, b, previousBest || undefined));
};

export const findBestMove = (
  board: Board,
  player: Player,
  depth: number
): MoveEvaluation | null => {
  // まずキャッシュをチェック
  const cached = globalBoardCache.get(board, depth, player, true);
  if (cached?.bestMove) {
    return {
      position: cached.bestMove,
      score: createEvaluationScore(cached.evaluation),
      depth: depth,
    };
  }

  const validMoves = getAllValidMoves(board, player);

  if (validMoves.length === 0) {
    return null;
  }

  let bestMove: MoveEvaluation | null = null;
  let bestScore = player === 'black' ? MAX_SCORE : MIN_SCORE;

  // ムーブオーダリング：角と辺を優先的に探索
  const orderedMoves = [...validMoves].sort(compareMovesByPriority);

  for (const move of orderedMoves) {
    const newBoard = makeMove(board, move, player);
    const score = minimax(newBoard, getOpponent(player), depth, MIN_SCORE, MAX_SCORE);

    if (player === 'black' && score < bestScore) {
      bestScore = score;
      bestMove = {
        position: { row: move.row, col: move.col },
        score: createEvaluationScore(score),
        depth: depth,
      };
    } else if (player === 'white' && score > bestScore) {
      bestScore = score;
      bestMove = {
        position: { row: move.row, col: move.col },
        score: createEvaluationScore(score),
        depth: depth,
      };
    }
  }

  // 最善手をキャッシュに保存
  if (bestMove) {
    globalBoardCache.set(board, bestScore, bestMove.position, depth, player, true);
  }

  return bestMove;
};
