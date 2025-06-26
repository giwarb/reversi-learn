import { getAdjacentToCorner, getAllCorners, isCorner } from '../game/boardUtils';
import { getAllValidMoves, getValidMove, makeMove } from '../game/rules';
import type { Board, Player, Position } from '../game/types';
import { evaluateBoard } from './evaluation';
import { findBestMove } from './minimax';

export interface BadMoveImpact {
  type:
    | 'corner_loss'
    | 'mobility_loss'
    | 'stable_loss'
    | 'position_weakness'
    | 'edge_weakness'
    | 'evaluation_loss';
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
  opponentBestResponseToRecommended: Position | null;
  futureConsequences: string[];
  evaluationAfterPlayerMove: number;
  evaluationAfterOpponentResponse: number;
  evaluationChangeFromOpponent: number;
  bestMoveEvaluationAfterOpponent: number;
  bestMoveEvaluationChange: number;
}

const analyzeCornerVulnerability = (
  board: Board,
  move: Position,
  player: Player
): BadMoveImpact | null => {
  const corners = getAllCorners();

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
            description: `相手に角${String.fromCharCode('a'.charCodeAt(0) + corner.col)}${corner.row + 1}を取られる危険があります`,
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

const analyzeEvaluationLoss = (
  _board: Board,
  _playerMove: Position,
  bestMove: Position | null,
  _player: Player,
  scoreDifference: number
): BadMoveImpact | null => {
  if (!bestMove || scoreDifference < 10) return null;

  // 評価値の差に基づいて説明を生成
  let description = '';
  let severity: 'high' | 'medium' | 'low' = 'low';

  if (scoreDifference >= 50) {
    description = `この手は最善手より${scoreDifference.toFixed(0)}点も評価が低いです`;
    severity = 'high';
  } else if (scoreDifference >= 30) {
    description = `評価値が${scoreDifference.toFixed(0)}点低下します`;
    severity = 'medium';
  } else if (scoreDifference >= 10) {
    description = `わずかに評価値が下がります（${scoreDifference.toFixed(0)}点）`;
    severity = 'low';
  }

  if (description) {
    return {
      type: 'evaluation_loss',
      description,
      affectedPositions: [bestMove],
      severity,
    };
  }

  return null;
};

const analyzeEdgeWeakness = (
  board: Board,
  move: Position,
  _player: Player
): BadMoveImpact | null => {
  // 辺のC-square（角から2つ目）の危険な位置
  const dangerousEdgePositions = [
    // 上辺
    { row: 0, col: 1 },
    { row: 0, col: 6 },
    // 下辺
    { row: 7, col: 1 },
    { row: 7, col: 6 },
    // 左辺
    { row: 1, col: 0 },
    { row: 6, col: 0 },
    // 右辺
    { row: 1, col: 7 },
    { row: 6, col: 7 },
  ];

  const isDangerous = dangerousEdgePositions.some(
    (pos) => pos.row === move.row && pos.col === move.col
  );

  if (isDangerous) {
    // 対応する角が空いているか確認
    const adjacentCorners: Position[] = [];

    if (move.row === 0) {
      if (move.col === 1 && board[0][0] === null) adjacentCorners.push({ row: 0, col: 0 });
      if (move.col === 6 && board[0][7] === null) adjacentCorners.push({ row: 0, col: 7 });
    } else if (move.row === 7) {
      if (move.col === 1 && board[7][0] === null) adjacentCorners.push({ row: 7, col: 0 });
      if (move.col === 6 && board[7][7] === null) adjacentCorners.push({ row: 7, col: 7 });
    } else if (move.col === 0) {
      if (move.row === 1 && board[0][0] === null) adjacentCorners.push({ row: 0, col: 0 });
      if (move.row === 6 && board[7][0] === null) adjacentCorners.push({ row: 7, col: 0 });
    } else if (move.col === 7) {
      if (move.row === 1 && board[0][7] === null) adjacentCorners.push({ row: 0, col: 7 });
      if (move.row === 6 && board[7][7] === null) adjacentCorners.push({ row: 7, col: 7 });
    }

    if (adjacentCorners.length > 0) {
      return {
        type: 'edge_weakness',
        description: 'C-スクエア（辺の危険な位置）に打つと相手に角を取られやすくなります',
        affectedPositions: adjacentCorners,
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
  depth: number,
  precomputedBestMove?: Position | null
): DetailedBadMoveAnalysis => {
  const bestMove = precomputedBestMove ?? findBestMove(board, player, depth + 1)?.position ?? null;

  // 評価値の差を計算
  const playerValidMove = getValidMove(board, playerMove, player);
  if (!playerValidMove) {
    return {
      playerMove,
      bestMove,
      scoreDifference: 0,
      impacts: [],
      opponentBestResponse: null,
      opponentBestResponseToRecommended: null,
      futureConsequences: [],
      evaluationAfterPlayerMove: 0,
      evaluationAfterOpponentResponse: 0,
      evaluationChangeFromOpponent: 0,
      bestMoveEvaluationAfterOpponent: 0,
      bestMoveEvaluationChange: 0,
    };
  }

  const playerBoard = makeMove(board, playerValidMove, player);
  const playerScore = evaluateBoard(playerBoard);

  let bestScore = playerScore;
  let bestMoveBoard: Board | null = null;
  if (bestMove) {
    const bestValidMove = getValidMove(board, bestMove, player);
    if (bestValidMove) {
      bestMoveBoard = makeMove(board, bestValidMove, player);
      bestScore = evaluateBoard(bestMoveBoard);
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

  // 辺の弱さをチェック
  const edgeImpact = analyzeEdgeWeakness(board, playerMove, player);
  if (edgeImpact) impacts.push(edgeImpact);

  // 評価値の損失をチェック
  const evaluationImpact = analyzeEvaluationLoss(
    board,
    playerMove,
    bestMove,
    player,
    scoreDifference
  );
  if (evaluationImpact) impacts.push(evaluationImpact);

  // 相手の最善応手を計算
  const opponent: Player = player === 'black' ? 'white' : 'black';
  const newBoard = makeMove(board, playerValidMove, player);
  const opponentBest = findBestMove(newBoard, opponent, depth - 1);
  const opponentBestResponse = opponentBest ? opponentBest.position : null;

  // 将来の影響を分析
  const futureConsequences: string[] = [];

  // 相手の応手後の評価値を計算
  let evaluationAfterOpponentResponse = playerScore;
  let evaluationChangeFromOpponent = 0;

  if (opponentBestResponse) {
    if (isCorner(opponentBestResponse)) {
      futureConsequences.push('相手が角を取ることができます');
    }

    const opponentValidMove = getValidMove(newBoard, opponentBestResponse, opponent);
    if (opponentValidMove) {
      const afterOpponentBoard = makeMove(newBoard, opponentValidMove, opponent);
      evaluationAfterOpponentResponse = evaluateBoard(afterOpponentBoard);
      evaluationChangeFromOpponent = evaluationAfterOpponentResponse - playerScore;

      const playerFutureMoves = getAllValidMoves(afterOpponentBoard, player);
      if (playerFutureMoves.length < 3) {
        futureConsequences.push('次の手番で選択肢が大幅に制限されます');
      }
    }
  }

  // 最善手を打った場合の相手の応手後の評価値を計算
  let bestMoveEvaluationAfterOpponent = bestScore;
  let bestMoveEvaluationChange = 0;
  let opponentBestResponseToRecommended: Position | null = null;

  if (bestMoveBoard && bestMove) {
    const opponentBestResponseToBestMove = findBestMove(bestMoveBoard, opponent, depth - 1);
    if (opponentBestResponseToBestMove) {
      opponentBestResponseToRecommended = opponentBestResponseToBestMove.position;
      const opponentValidMoveToBestMove = getValidMove(
        bestMoveBoard,
        opponentBestResponseToBestMove.position,
        opponent
      );
      if (opponentValidMoveToBestMove) {
        const afterOpponentBestMoveBoard = makeMove(
          bestMoveBoard,
          opponentValidMoveToBestMove,
          opponent
        );
        bestMoveEvaluationAfterOpponent = evaluateBoard(afterOpponentBestMoveBoard);
        bestMoveEvaluationChange = bestMoveEvaluationAfterOpponent - bestScore;
      }
    }
  }

  return {
    playerMove,
    bestMove,
    scoreDifference,
    impacts,
    opponentBestResponse,
    opponentBestResponseToRecommended,
    futureConsequences,
    evaluationAfterPlayerMove: playerScore,
    evaluationAfterOpponentResponse,
    evaluationChangeFromOpponent,
    bestMoveEvaluationAfterOpponent,
    bestMoveEvaluationChange,
  };
};
