import { getAdjacentCorner, isCorner, isCSquare, isEdge, isXSquare } from '../game/boardUtils';
import { getAllValidMoves, getOpponent } from '../game/rules';
import type { Board, Player, Position } from '../game/types';

// Re-export for backward compatibility
export { isCorner, isEdge, isXSquare, isCSquare, getAdjacentCorner };

export interface EvaluationReason {
  type: string;
  description: string;
  impact: 'positive' | 'negative';
  value: number;
}

export const analyzeMove = (
  board: Board,
  position: Position,
  player: Player
): EvaluationReason[] => {
  const reasons: EvaluationReason[] = [];

  // 角の評価
  if (isCorner(position)) {
    reasons.push({
      type: 'corner',
      description: '角を取ることができます',
      impact: 'positive',
      value: 100,
    });
  }

  // X打ちの評価
  if (isXSquare(position)) {
    const adjacentCorner = getAdjacentCorner(position);
    if (board[adjacentCorner.row][adjacentCorner.col] === null) {
      reasons.push({
        type: 'x-square',
        description: '相手に角を取られる可能性があります（X打ち）',
        impact: 'negative',
        value: -50,
      });
    }
  }

  // C打ちの評価
  if (isCSquare(position)) {
    const adjacentCorner = getAdjacentCorner(position);
    if (board[adjacentCorner.row][adjacentCorner.col] === null) {
      reasons.push({
        type: 'c-square',
        description: '相手に角を取られる可能性があります（C打ち）',
        impact: 'negative',
        value: -25,
      });
    }
  }

  // 着手可能数の評価
  const currentMobility = getAllValidMoves(board, player).length;
  const opponentMobility = getAllValidMoves(board, getOpponent(player)).length;
  const mobilityDiff = currentMobility - opponentMobility;

  if (Math.abs(mobilityDiff) >= 5) {
    reasons.push({
      type: 'mobility',
      description:
        mobilityDiff > 0
          ? `着手可能数で有利です（${currentMobility} vs ${opponentMobility}）`
          : `着手可能数で不利です（${currentMobility} vs ${opponentMobility}）`,
      impact: mobilityDiff > 0 ? 'positive' : 'negative',
      value: mobilityDiff * 10,
    });
  }

  // 辺の確保
  if (isEdge(position) && !isCorner(position) && !isCSquare(position)) {
    reasons.push({
      type: 'edge',
      description: '辺の石を確保できます',
      impact: 'positive',
      value: 10,
    });
  }

  return reasons;
};

export const explainEvaluation = (board: Board, position: Position, player: Player): string => {
  const reasons = analyzeMove(board, position, player);

  if (reasons.length === 0) {
    return '通常の手です。';
  }

  const positiveReasons = reasons.filter((r) => r.impact === 'positive');
  const negativeReasons = reasons.filter((r) => r.impact === 'negative');

  let explanation = '';

  if (positiveReasons.length > 0) {
    explanation += '良い手です：\n';
    positiveReasons.forEach((r) => {
      explanation += `・${r.description}\n`;
    });
  }

  if (negativeReasons.length > 0) {
    if (explanation) explanation += '\n';
    explanation += '注意が必要な点：\n';
    negativeReasons.forEach((r) => {
      explanation += `・${r.description}\n`;
    });
  }

  return explanation.trim();
};
