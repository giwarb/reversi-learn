import { checkGameOver } from '../game/gameState';
import { getAllValidMoves, getOpponent, makeMove } from '../game/rules';
import type { Board, GameState, Player } from '../game/types';
import { globalBoardCache } from './cache/boardCache';
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
  // キャッシュをチェック
  const cached = globalBoardCache.get(board, depth);
  if (cached !== null) {
    return cached.evaluation;
  }

  // 深さ0または終了状態なら評価値を返す
  if (depth === 0) {
    const evaluation = evaluateBoard(board, originalPlayer);
    globalBoardCache.set(board, evaluation, null, 0);
    return evaluation;
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
        fullMoveHistory: [],
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
    let bestMove = null;

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

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestMove = move;
      }
      alpha = Math.max(alpha, evaluation);

      if (beta <= alpha) {
        break; // ベータカット
      }
    }

    // 結果をキャッシュに保存
    globalBoardCache.set(board, maxEval, bestMove, depth);
    return maxEval;
  } else {
    let minEval = MAX_SCORE;
    let bestMove = null;

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

      if (evaluation < minEval) {
        minEval = evaluation;
        bestMove = move;
      }
      beta = Math.min(beta, evaluation);

      if (beta <= alpha) {
        break; // アルファカット
      }
    }

    // 結果をキャッシュに保存
    globalBoardCache.set(board, minEval, bestMove, depth);
    return minEval;
  }
};

export const findBestMove = (
  board: Board,
  player: Player,
  maxDepth: number
): MoveEvaluation | null => {
  // まずキャッシュをチェック
  const cached = globalBoardCache.get(board, maxDepth);
  if (cached !== null && cached.bestMove) {
    return {
      position: cached.bestMove,
      score: cached.evaluation,
      depth: maxDepth,
    };
  }

  const validMoves = getAllValidMoves(board, player);

  if (validMoves.length === 0) {
    return null;
  }

  let bestMove: MoveEvaluation | null = null;
  let bestScore = MIN_SCORE;

  // ムーブオーダリング：角と辺を優先的に探索
  const orderedMoves = [...validMoves].sort((a, b) => {
    const isCornerA = (a.row === 0 || a.row === 7) && (a.col === 0 || a.col === 7);
    const isCornerB = (b.row === 0 || b.row === 7) && (b.col === 0 || b.col === 7);
    if (isCornerA && !isCornerB) return -1;
    if (!isCornerA && isCornerB) return 1;
    
    const isEdgeA = a.row === 0 || a.row === 7 || a.col === 0 || a.col === 7;
    const isEdgeB = b.row === 0 || b.row === 7 || b.col === 0 || b.col === 7;
    if (isEdgeA && !isEdgeB) return -1;
    if (!isEdgeA && isEdgeB) return 1;
    
    return 0;
  });

  for (const move of orderedMoves) {
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

  // 最善手をキャッシュに保存
  if (bestMove) {
    globalBoardCache.set(board, bestScore, bestMove.position, maxDepth);
  }

  return bestMove;
};
