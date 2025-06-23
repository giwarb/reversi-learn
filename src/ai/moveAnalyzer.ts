import { getAllValidMoves, makeMove } from '../game/rules';
import type { Board, Player, Position } from '../game/types';
import { evaluateBoard } from './evaluation';
import { analyzeMove } from './evaluationReasons';
import type { MoveEvaluation } from './types';

export interface MoveAnalysis {
  position: Position;
  score: number;
  scoreDiff: number;
  reasons: string[];
  isBadMove: boolean;
}

export const analyzeBadMove = (
  board: Board,
  playerMove: Position,
  player: Player,
  aiDepth: number
): MoveAnalysis | null => {
  // プレイヤーの手の評価
  const validMoves = getAllValidMoves(board, player);
  const playerMoveData = validMoves.find(
    (m) => m.row === playerMove.row && m.col === playerMove.col
  );

  if (!playerMoveData) {
    return null;
  }

  // 各手の評価値を計算
  const moveScores: MoveEvaluation[] = [];
  for (const move of validMoves) {
    const newBoard = makeMove(board, move, player);
    const score = evaluateBoard(newBoard, player);
    moveScores.push({
      position: { row: move.row, col: move.col },
      score,
      depth: aiDepth,
    });
  }

  // 最善手を見つける
  const bestMove = moveScores.reduce((best, current) =>
    current.score > best.score ? current : best
  );

  // プレイヤーの手のスコアを見つける
  const playerScore = moveScores.find(
    (m) => m.position.row === playerMove.row && m.position.col === playerMove.col
  );

  if (!playerScore) {
    return null;
  }

  const scoreDiff = bestMove.score - playerScore.score;
  const isBadMove = scoreDiff > 50; // 50点以上の差があれば悪手

  // 理由の分析
  const moveReasons = analyzeMove(board, playerMove, player);
  const reasons: string[] = [];

  if (isBadMove) {
    reasons.push(`より良い手がありました（評価値差: ${scoreDiff.toFixed(0)}）`);
    reasons.push(`最善手: (${bestMove.position.row + 1}, ${bestMove.position.col + 1})`);
  }

  moveReasons.forEach((reason) => {
    if (reason.impact === 'negative') {
      reasons.push(reason.description);
    }
  });

  return {
    position: playerMove,
    score: playerScore.score,
    scoreDiff,
    reasons,
    isBadMove,
  };
};

export const compareMovesWithAI = (
  board: Board,
  playerMove: Position,
  aiMove: Position | null,
  player: Player
): string => {
  if (!aiMove) {
    return 'AIは有効な手を見つけられませんでした。';
  }

  if (playerMove.row === aiMove.row && playerMove.col === aiMove.col) {
    return '最善手を選びました！';
  }

  const playerReasons = analyzeMove(board, playerMove, player);
  const aiReasons = analyzeMove(board, aiMove, player);

  let comparison = `AIの推奨手: (${aiMove.row + 1}, ${aiMove.col + 1})\n\n`;

  comparison += 'あなたの手の分析:\n';
  if (playerReasons.length === 0) {
    comparison += '・通常の手です\n';
  } else {
    playerReasons.forEach((reason) => {
      comparison += `・${reason.description}\n`;
    });
  }

  comparison += '\nAIの推奨手の理由:\n';
  if (aiReasons.length === 0) {
    comparison += '・評価値が最も高い手です\n';
  } else {
    aiReasons
      .filter((r) => r.impact === 'positive')
      .forEach((reason) => {
        comparison += `・${reason.description}\n`;
      });
  }

  return comparison;
};
