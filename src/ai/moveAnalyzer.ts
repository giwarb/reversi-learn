import { EVALUATION_CONSTANTS, MOVE_QUALITY_CONSTANTS } from '../constants/ai';
import { getAllValidMoves, getOpponent, makeMove } from '../game/rules';
import type { Board, Player, Position } from '../game/types';
import { createEvaluationScore } from '../game/types';
import { analyzeMove } from './evaluationReasons';
import { minimax } from './minimax';
import type { MoveEvaluation } from './types';

export interface MoveRankingAnalysis {
  position: Position;
  score: number;
  scoreDiff: number;
  reasons: string[];
  isBadMove: boolean;
  rank?: number; // 順位（1が最善手）
  totalMoves?: number; // 有効な手の総数
  percentile?: number; // パーセンタイル（0-100）
  allMoves?: MoveEvaluation[]; // 全ての合法手とその評価値
}

export const analyzeMoveRanking = (
  board: Board,
  playerMove: Position,
  player: Player,
  depth: number
): MoveRankingAnalysis | null => {
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
    // 深さ4の探索で評価
    const score = minimax(
      newBoard,
      getOpponent(player),
      depth,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );
    moveScores.push({
      position: { row: move.row, col: move.col },
      score: createEvaluationScore(score),
      depth,
    });
  }

  // スコアでソート（黒は昇順、白は降順）
  if (player === 'black') {
    moveScores.sort((a, b) => (a.score as number) - (b.score as number)); // 黒は小さい値が良い
  } else {
    moveScores.sort((a, b) => (b.score as number) - (a.score as number)); // 白は大きい値が良い
  }

  // 最善手を見つける
  const bestMove = moveScores[0];

  // プレイヤーの手のスコアを見つける
  const playerScore = moveScores.find(
    (m) => m.position.row === playerMove.row && m.position.col === playerMove.col
  );

  if (!playerScore) {
    return null;
  }

  // 同率を考慮した順位を計算
  let playerRank = 1;
  for (const move of moveScores) {
    // プレイヤーによって比較条件を変える
    const isBetter =
      player === 'black'
        ? (move.score as number) < (playerScore.score as number) // 黒は小さい値が良い
        : (move.score as number) > (playerScore.score as number); // 白は大きい値が良い

    if (isBetter) {
      playerRank++;
    } else {
      break;
    }
  }

  // 同じスコアの手の数を数える
  const sameScoreCount = moveScores.filter(
    (m) => (m.score as number) === (playerScore.score as number)
  ).length;

  const scoreDiff = (bestMove.score as number) - (playerScore.score as number);
  const totalMoves = moveScores.length;

  // パーセンタイルの計算（同率の場合は最も良い順位で計算）
  const percentile = ((totalMoves - playerRank + 1) / totalMoves) * 100;

  // 悪手判定
  const isBadMove = percentile < MOVE_QUALITY_CONSTANTS.BAD_MOVE_THRESHOLD;

  // 理由の分析
  const moveReasons = analyzeMove(board, playerMove, player);
  const reasons: string[] = [];

  if (isBadMove) {
    if (sameScoreCount > 1) {
      reasons.push(`${totalMoves}手中${playerRank}位タイの手です（上位${percentile.toFixed(0)}%）`);
    } else {
      reasons.push(`${totalMoves}手中${playerRank}位の手です（上位${percentile.toFixed(0)}%）`);
    }
    if (percentile < MOVE_QUALITY_CONSTANTS.TERRIBLE_MOVE_THRESHOLD) {
      reasons.push('これは大悪手です！');
    } else if (percentile < MOVE_QUALITY_CONSTANTS.SUGGEST_BETTER_THRESHOLD) {
      reasons.push('より良い手を選ぶことをお勧めします。');
    }
    const bestColLetter = String.fromCharCode('a'.charCodeAt(0) + bestMove.position.col);
    const bestRowNumber = bestMove.position.row + 1;
    reasons.push(`最善手: ${bestColLetter}${bestRowNumber}`);
  }

  moveReasons.forEach((reason) => {
    if (reason.impact === 'negative') {
      reasons.push(reason.description);
    }
  });

  return {
    position: playerMove,
    score: playerScore.score as number,
    scoreDiff,
    reasons,
    isBadMove,
    rank: playerRank,
    totalMoves,
    percentile,
    allMoves: moveScores,
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

  const aiColLetter = String.fromCharCode('a'.charCodeAt(0) + aiMove.col);
  const aiRowNumber = aiMove.row + 1;
  let comparison = `AIの推奨手: ${aiColLetter}${aiRowNumber}\n\n`;

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

// Backward compatibility - deprecated, use analyzeMoveRanking instead
export const analyzeBadMove = analyzeMoveRanking;
export type MoveAnalysis = MoveRankingAnalysis;
