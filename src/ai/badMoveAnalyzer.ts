import { getAllValidMoves, getValidMove, makeMove } from '../game/rules';
import type { Board, Player, Position } from '../game/types';
import { evaluateBoard } from './evaluation';
import { findBestMove } from './minimax';

export interface BadMoveImpact {
  type: 'corner_loss' | 'mobility_loss' | 'stable_loss' | 'position_weakness';
  description: string;
  affectedPositions: Position[];
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface DetailedBadMoveAnalysis {
  playerMove: Position;
  bestMove: Position | null;
  scoreDifference: number;
  impacts: BadMoveImpact[];
  opponentBestResponse: Position | null;
  futureConsequences: string[];
}

const isCorner = (pos: Position): boolean => {
  return (pos.row === 0 || pos.row === 7) && (pos.col === 0 || pos.col === 7);
};

// const _isEdge = (pos: Position): boolean => {
//   return pos.row === 0 || pos.row === 7 || pos.col === 0 || pos.col === 7;
// };

const getAdjacentToCorner = (corner: Position): Position[] => {
  const adjacent: Position[] = [];
  const { row, col } = corner;

  // 角の隣接マス（X-square と C-square）
  if (row === 0 && col === 0) {
    adjacent.push({ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 });
  } else if (row === 0 && col === 7) {
    adjacent.push({ row: 0, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 6 });
  } else if (row === 7 && col === 0) {
    adjacent.push({ row: 7, col: 1 }, { row: 6, col: 0 }, { row: 6, col: 1 });
  } else if (row === 7 && col === 7) {
    adjacent.push({ row: 7, col: 6 }, { row: 6, col: 7 }, { row: 6, col: 6 });
  }

  return adjacent;
};

const analyzeCornerVulnerability = (
  board: Board,
  move: Position,
  player: Player
): BadMoveImpact | null => {
  const corners: Position[] = [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 0 },
    { row: 7, col: 7 },
  ];

  for (const corner of corners) {
    // 角が空いている場合
    if (board[corner.row][corner.col] === null) {
      const adjacentPositions = getAdjacentToCorner(corner);

      // プレイヤーの手が角の隣接マスの場合
      if (adjacentPositions.some((pos) => pos.row === move.row && pos.col === move.col)) {
        // この手を打った後の盤面で相手が角を取れるか確認
        const validMove = getValidMove(board, move, player);
        if (!validMove) return null;

        const newBoard = makeMove(board, validMove, player);
        const opponent: Player = player === 'black' ? 'white' : 'black';
        const opponentMoves = getAllValidMoves(newBoard, opponent);

        if (opponentMoves.some((m) => m.row === corner.row && m.col === corner.col)) {
          return {
            type: 'corner_loss',
            description: `相手に角(${corner.row + 1}, ${corner.col + 1})を取られる危険があります`,
            affectedPositions: [corner],
            severity: 'critical',
          };
        }
      }
    }
  }

  return null;
};

const analyzeMobilityLoss = (
  board: Board,
  move: Position,
  player: Player
): BadMoveImpact | null => {
  const opponent: Player = player === 'black' ? 'white' : 'black';

  // 現在の着手可能数
  const currentMobility = getAllValidMoves(board, player).length;

  // 手を打った後の盤面
  const validMove = getValidMove(board, move, player);
  if (!validMove) return null;

  const newBoard = makeMove(board, validMove, player);

  // 相手の手番後のシミュレーション
  const opponentBestMove = findBestMove(newBoard, opponent, 3);
  if (!opponentBestMove) return null;

  const opponentValidMove = getValidMove(newBoard, opponentBestMove.position, opponent);
  if (!opponentValidMove) return null;

  const afterOpponentBoard = makeMove(newBoard, opponentValidMove, opponent);
  const futureMobility = getAllValidMoves(afterOpponentBoard, player).length;

  const mobilityLoss = currentMobility - futureMobility;

  if (mobilityLoss > 3) {
    return {
      type: 'mobility_loss',
      description: `次の手番で打てる場所が${mobilityLoss}箇所も減ってしまいます`,
      affectedPositions: [],
      severity: mobilityLoss > 5 ? 'high' : 'medium',
    };
  }

  return null;
};

const analyzePositionWeakness = (
  board: Board,
  move: Position,
  _player: Player
): BadMoveImpact | null => {
  // 危険な位置（角の隣のX-square）
  const dangerousPositions = [
    { row: 1, col: 1 },
    { row: 1, col: 6 },
    { row: 6, col: 1 },
    { row: 6, col: 6 },
  ];

  if (dangerousPositions.some((pos) => pos.row === move.row && pos.col === move.col)) {
    // 対応する角が空いているか確認
    const cornerMap: Record<string, Position> = {
      '1,1': { row: 0, col: 0 },
      '1,6': { row: 0, col: 7 },
      '6,1': { row: 7, col: 0 },
      '6,6': { row: 7, col: 7 },
    };

    const cornerKey = `${move.row},${move.col}`;
    const corner = cornerMap[cornerKey];
    if (corner && board[corner.row][corner.col] === null) {
      return {
        type: 'position_weakness',
        description: 'X-スクエア（角の斜め隣）に打つのは危険です',
        affectedPositions: [corner],
        severity: 'high',
      };
    }
  }

  return null;
};

export const analyzeDetailedBadMove = (
  board: Board,
  playerMove: Position,
  player: Player,
  aiDepth: number
): DetailedBadMoveAnalysis => {
  // AIの最善手を取得
  const aiEvaluation = findBestMove(board, player, aiDepth);
  const bestMove = aiEvaluation ? aiEvaluation.position : null;

  // 評価値の差を計算
  const playerValidMove = getValidMove(board, playerMove, player);
  if (!playerValidMove) {
    return {
      playerMove,
      bestMove,
      scoreDifference: 0,
      impacts: [],
      opponentBestResponse: null,
      futureConsequences: [],
    };
  }

  const playerBoard = makeMove(board, playerValidMove, player);
  const playerScore = evaluateBoard(playerBoard, player);

  let bestScore = playerScore;
  if (bestMove) {
    const bestValidMove = getValidMove(board, bestMove, player);
    if (bestValidMove) {
      bestScore = evaluateBoard(makeMove(board, bestValidMove, player), player);
    }
  }

  const scoreDifference = bestScore - playerScore;

  // 影響の分析
  const impacts: BadMoveImpact[] = [];

  // 角の脆弱性をチェック
  const cornerImpact = analyzeCornerVulnerability(board, playerMove, player);
  if (cornerImpact) impacts.push(cornerImpact);

  // 着手可能数の減少をチェック
  const mobilityImpact = analyzeMobilityLoss(board, playerMove, player);
  if (mobilityImpact) impacts.push(mobilityImpact);

  // 位置の弱さをチェック
  const positionImpact = analyzePositionWeakness(board, playerMove, player);
  if (positionImpact) impacts.push(positionImpact);

  // 相手の最善応手を計算
  const opponent: Player = player === 'black' ? 'white' : 'black';
  const newBoard = makeMove(board, playerValidMove, player);
  const opponentBest = findBestMove(newBoard, opponent, aiDepth - 1);
  const opponentBestResponse = opponentBest ? opponentBest.position : null;

  // 将来の影響を分析
  const futureConsequences: string[] = [];

  if (opponentBestResponse) {
    if (isCorner(opponentBestResponse)) {
      futureConsequences.push('相手が角を取ることができます');
    }

    const opponentValidMove = getValidMove(newBoard, opponentBestResponse, opponent);
    if (opponentValidMove) {
      const afterOpponentBoard = makeMove(newBoard, opponentValidMove, opponent);
      const playerFutureMoves = getAllValidMoves(afterOpponentBoard, player);
      if (playerFutureMoves.length < 3) {
        futureConsequences.push('次の手番で選択肢が大幅に制限されます');
      }
    }
  }

  return {
    playerMove,
    bestMove,
    scoreDifference,
    impacts,
    opponentBestResponse,
    futureConsequences,
  };
};
