import { checkGameOver } from '../game/gameState';
import { getAllValidMoves, getOpponent, makeMove, getValidMove } from '../game/rules';
import type { Board, GameState, Player, Position } from '../game/types';
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
  const cached = globalBoardCache.get(board, depth, originalPlayer, maximizingPlayer);
  if (cached !== null) {
    return cached.evaluation;
  }

  // 深さ0または終了状態なら評価値を返す
  if (depth === 0) {
    const evaluation = evaluateBoard(board, originalPlayer);
    globalBoardCache.set(board, evaluation, null, 0, originalPlayer, maximizingPlayer);
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
    globalBoardCache.set(board, maxEval, bestMove, depth, originalPlayer, maximizingPlayer);
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
    globalBoardCache.set(board, minEval, bestMove, depth, originalPlayer, maximizingPlayer);
    return minEval;
  }
};

export const findBestMoveIterativeDeepening = (
  board: Board,
  player: Player,
  maxDepth: number,
  timeLimitMs: number = 5000
): MoveEvaluation | null => {
  const startTime = Date.now();
  let bestMoveAtDepth: MoveEvaluation | null = null;
  let previousBestMove: Position | null = null;
  const pv: Position[] = [];

  // 深さ1から最大深さまで段階的に探索
  for (let currentDepth = 1; currentDepth <= maxDepth; currentDepth++) {
    const depthStartTime = Date.now();
    
    // 時間チェック - 残り時間が前回の探索時間の2倍未満なら打ち切り
    const elapsedTime = depthStartTime - startTime;
    const remainingTime = timeLimitMs - elapsedTime;
    
    if (currentDepth > 1 && remainingTime < (depthStartTime - startTime) * 2) {
      break;
    }

    const validMoves = getAllValidMoves(board, player);
    if (validMoves.length === 0) {
      return null;
    }

    // ムーブオーダリング：前の深さの最善手を最初に探索
    const orderedMoves = orderMoves(validMoves, previousBestMove);
    
    let bestMove: MoveEvaluation | null = null;
    let bestScore = MIN_SCORE;
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
      const score = minimax(
        newBoard,
        getOpponent(player),
        currentDepth - 1,
        alpha,
        beta,
        false,
        player
      );

      if (score > bestScore) {
        bestScore = score;
        bestMove = {
          position: { row: move.row, col: move.col },
          score,
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
  if (!previousBest) {
    // 前回の最善手がない場合は、角と辺を優先
    return [...moves].sort((a, b) => {
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
  }

  // 前回の最善手を最初に、その後は角と辺を優先
  return [...moves].sort((a, b) => {
    // 前回の最善手を最優先
    if (a.row === previousBest.row && a.col === previousBest.col) return -1;
    if (b.row === previousBest.row && b.col === previousBest.col) return 1;
    
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
};

export const findBestMove = (
  board: Board,
  player: Player,
  maxDepth: number
): MoveEvaluation | null => {
  // まずキャッシュをチェック
  const cached = globalBoardCache.get(board, maxDepth, player, true);
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
    globalBoardCache.set(board, bestScore, bestMove.position, maxDepth, player, true);
  }

  return bestMove;
};
