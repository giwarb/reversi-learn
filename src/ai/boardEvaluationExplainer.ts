import {
  copyBoard,
  getAllCorners,
  isCorner,
  isCSquare,
  isEdge,
  isXSquare,
} from '../game/boardUtils';
import { BOARD_SIZE } from '../game/constants';
import { getAllValidMoves, getOpponent } from '../game/rules';
import type { Board, Player, Position } from '../game/types';
import { evaluateStableDiscs } from './evaluation';

export interface MobilityAnalysis {
  playerMoves: number;
  opponentMoves: number;
  advantage: 'player' | 'opponent' | 'even';
  playerPositions: Position[];
  opponentPositions: Position[];
}

export interface OpponentRestriction {
  isRestricted: boolean;
  restrictedToXC: boolean;
  positions: Position[];
  xSquares: Position[];
  cSquares: Position[];
}

export interface StrongPositions {
  corners: Position[];
  edges: Position[];
  stableDiscs: Position[];
  stableCount: {
    player: number;
    opponent: number;
  };
}

export interface NextMoveStrength {
  canTakeCorner: boolean;
  cornerPositions: Position[];
  canCreateStableEdge: boolean;
  edgePositions: Position[];
  canSeverelyLimitOpponent: boolean;
}

export interface BoardEvaluationExplanation {
  mobility: MobilityAnalysis;
  opponentRestriction: OpponentRestriction;
  strongPositions: StrongPositions;
  nextMoveStrength: NextMoveStrength;
  overallAssessment: string;
  details: string[];
}

// マスの座標を棋譜形式（例：a1, h8）に変換
const positionToNotation = (pos: Position): string => {
  const col = String.fromCharCode('a'.charCodeAt(0) + pos.col);
  const row = pos.row + 1;
  return `${col}${row}`;
};

// 複数の座標を棋譜形式の文字列に変換
const positionsToNotation = (positions: Position[]): string => {
  return positions.map(positionToNotation).join(', ');
};

// 機動力（合法手数）の分析
const analyzeMobility = (board: Board, player: Player): MobilityAnalysis => {
  const playerMoves = getAllValidMoves(board, player);
  const opponentMoves = getAllValidMoves(board, getOpponent(player));

  let advantage: 'player' | 'opponent' | 'even';
  if (playerMoves.length > opponentMoves.length + 2) {
    advantage = 'player';
  } else if (opponentMoves.length > playerMoves.length + 2) {
    advantage = 'opponent';
  } else {
    advantage = 'even';
  }

  return {
    playerMoves: playerMoves.length,
    opponentMoves: opponentMoves.length,
    advantage,
    playerPositions: playerMoves,
    opponentPositions: opponentMoves,
  };
};

// 相手の手の制限を分析
const analyzeOpponentRestriction = (board: Board, player: Player): OpponentRestriction => {
  const opponentMoves = getAllValidMoves(board, getOpponent(player));
  const xSquares = opponentMoves.filter((move) => isXSquare(move));
  const cSquares = opponentMoves.filter((move) => isCSquare(move));

  const dangerousMoves = [...xSquares, ...cSquares];
  const isRestricted = opponentMoves.length <= 4;
  const restrictedToXC = dangerousMoves.length === opponentMoves.length && opponentMoves.length > 0;

  return {
    isRestricted,
    restrictedToXC,
    positions: opponentMoves,
    xSquares,
    cSquares,
  };
};

// 強い位置の占有状況を分析
const analyzeStrongPositions = (board: Board, player: Player): StrongPositions => {
  const corners: Position[] = [];
  const edges: Position[] = [];
  const stableDiscs: Position[] = [];

  // 角の確認
  const cornerPositions = getAllCorners();

  for (const pos of cornerPositions) {
    if (board[pos.row][pos.col] === player) {
      corners.push(pos);
      stableDiscs.push(pos); // 角は常に確定石
    }
  }

  // 辺の確認（角とC squareを除く）
  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const pos = { row, col };
      if (board[row][col] === player && isEdge(pos) && !isCorner(pos) && !isCSquare(pos)) {
        edges.push(pos);

        // 隣接する角が自分の石なら確定石
        if (isStableFromCorner(board, pos, player)) {
          stableDiscs.push(pos);
        }
      }
    }
  }

  // 確定石の評価値から実際の数を計算
  const stableEval = evaluateStableDiscs(board);
  const blackCount = board.flat().filter((cell) => cell === 'black').length;
  const whiteCount = board.flat().filter((cell) => cell === 'white').length;

  // 評価値から確定石の数を逆算（近似値）
  const totalStableApprox = (Math.abs(stableEval) * (blackCount + whiteCount)) / 100;
  const playerStableCount =
    player === 'black'
      ? stableEval < 0
        ? Math.round((totalStableApprox * blackCount) / (blackCount + whiteCount))
        : 0
      : stableEval > 0
        ? Math.round((totalStableApprox * whiteCount) / (blackCount + whiteCount))
        : 0;
  const opponentStableCount =
    player === 'black'
      ? stableEval > 0
        ? Math.round((totalStableApprox * whiteCount) / (blackCount + whiteCount))
        : 0
      : stableEval < 0
        ? Math.round((totalStableApprox * blackCount) / (blackCount + whiteCount))
        : 0;

  return {
    corners,
    edges,
    stableDiscs,
    stableCount: {
      player: playerStableCount,
      opponent: opponentStableCount,
    },
  };
};

// 角から連続している石は確定石
const isStableFromCorner = (board: Board, pos: Position, player: Player): boolean => {
  // 簡略化された確定石判定（角から連続している辺の石）
  const corners = getAllCorners();

  for (const corner of corners) {
    if (board[corner.row][corner.col] === player) {
      // 同じ行または列で角から連続しているか確認
      if (corner.row === pos.row) {
        const start = Math.min(corner.col, pos.col);
        const end = Math.max(corner.col, pos.col);
        let continuous = true;
        for (let col = start; col <= end; col++) {
          if (board[corner.row][col] !== player) {
            continuous = false;
            break;
          }
        }
        if (continuous) return true;
      }

      if (corner.col === pos.col) {
        const start = Math.min(corner.row, pos.row);
        const end = Math.max(corner.row, pos.row);
        let continuous = true;
        for (let row = start; row <= end; row++) {
          if (board[row][corner.col] !== player) {
            continuous = false;
            break;
          }
        }
        if (continuous) return true;
      }
    }
  }

  return false;
};

// 次の一手の強さを分析
const analyzeNextMoveStrength = (board: Board, player: Player): NextMoveStrength => {
  const validMoves = getAllValidMoves(board, player);
  const cornerPositions: Position[] = [];
  const edgePositions: Position[] = [];

  // 角が取れるかチェック
  for (const move of validMoves) {
    if (isCorner(move)) {
      cornerPositions.push(move);
    } else if (isEdge(move) && !isCSquare(move)) {
      edgePositions.push(move);
    }
  }

  // 相手の手を大きく制限できるかチェック
  let canSeverelyLimitOpponent = false;
  for (const move of validMoves) {
    const testBoard = copyBoard(board);
    // 仮に打ってみる
    testBoard[move.row][move.col] = player;
    const opponentMovesAfter = getAllValidMoves(testBoard, getOpponent(player));
    if (opponentMovesAfter.length <= 2) {
      canSeverelyLimitOpponent = true;
      break;
    }
  }

  return {
    canTakeCorner: cornerPositions.length > 0,
    cornerPositions,
    canCreateStableEdge: edgePositions.length > 0,
    edgePositions,
    canSeverelyLimitOpponent,
  };
};

// 盤面全体の評価を説明
export const explainBoardEvaluation = (
  board: Board,
  player: Player
): BoardEvaluationExplanation => {
  const mobility = analyzeMobility(board, player);
  const opponentRestriction = analyzeOpponentRestriction(board, player);
  const strongPositions = analyzeStrongPositions(board, player);
  const nextMoveStrength = analyzeNextMoveStrength(board, player);

  const details: string[] = [];

  // 機動力の説明
  if (mobility.advantage === 'player') {
    details.push(`✓ 着手可能数で優位（${mobility.playerMoves}手 vs ${mobility.opponentMoves}手）`);
  } else if (mobility.advantage === 'opponent') {
    details.push(`× 着手可能数で劣勢（${mobility.playerMoves}手 vs ${mobility.opponentMoves}手）`);
  } else {
    details.push(`- 着手可能数は互角（${mobility.playerMoves}手 vs ${mobility.opponentMoves}手）`);
  }

  // 相手の手の制限
  if (opponentRestriction.restrictedToXC) {
    const positions = positionsToNotation(opponentRestriction.positions);
    details.push(`✓ 相手の手がX・Cマスに制限されています（${positions}）`);
  } else if (opponentRestriction.isRestricted) {
    details.push(`✓ 相手の手が少ない（${opponentRestriction.positions.length}手のみ）`);
  }

  // 強い位置の占有
  if (strongPositions.corners.length > 0) {
    const cornerNotations = positionsToNotation(strongPositions.corners);
    details.push(`✓ 角を${strongPositions.corners.length}つ確保（${cornerNotations}）`);
  }

  if (strongPositions.stableCount.player > 0) {
    details.push(`✓ 確定石が約${strongPositions.stableCount.player}個あります`);
  }

  if (strongPositions.stableCount.opponent > strongPositions.stableCount.player) {
    details.push(`× 相手の確定石（約${strongPositions.stableCount.opponent}個）の方が多い`);
  }

  // 次の一手の強さ
  if (nextMoveStrength.canTakeCorner) {
    const cornerNotations = positionsToNotation(nextMoveStrength.cornerPositions);
    details.push(`✓ 次の手で角が取れます（${cornerNotations}）`);
  }

  if (nextMoveStrength.canSeverelyLimitOpponent) {
    details.push(`✓ 次の手で相手の手を大きく制限できます`);
  }

  // 総合評価
  let overallAssessment = '';
  const positiveCount = details.filter((d) => d.startsWith('✓')).length;
  const negativeCount = details.filter((d) => d.startsWith('×')).length;

  if (positiveCount >= 3 && negativeCount === 0) {
    overallAssessment = '非常に有利な局面です';
  } else if (positiveCount > negativeCount && positiveCount > 0) {
    overallAssessment = '有利な局面です';
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    overallAssessment = '不利な局面です';
  } else {
    overallAssessment = '互角の局面です';
  }

  return {
    mobility,
    opponentRestriction,
    strongPositions,
    nextMoveStrength,
    overallAssessment,
    details,
  };
};

// 簡潔な説明文を生成
export const getBriefExplanation = (explanation: BoardEvaluationExplanation): string => {
  return explanation.details.join('\n');
};
