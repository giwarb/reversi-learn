import { GAME_PHASE_CONSTANTS } from '../constants/ai';
import { countPieces } from '../game/board';
import type { Board, EvaluationScore, Player } from '../game/types';
import {
  evaluateMobility,
  evaluatePieceCount,
  evaluatePotentialMobilityScore,
  evaluateStableDiscs,
} from './evaluation';

/**
 * 統合評価システム
 * 評価値計算と盤面分析を同一データソースから生成
 */

export interface EvaluationComponent {
  score: number;
  playerAdvantage: boolean;
  rawPlayerValue: number;
  rawOpponentValue: number;
  weight: number;
}

export interface GamePhaseInfo {
  phase: 'early' | 'mid' | 'late';
  totalPieces: number;
  progressPercentage: number;
}

export interface UnifiedEvaluation {
  totalScore: number;
  gamePhase: GamePhaseInfo;
  components: {
    mobility: EvaluationComponent;
    stability: EvaluationComponent;
    position: EvaluationComponent;
    pieceCount: EvaluationComponent;
  };
  searchDepth?: number;
  searchScore?: number;
  confidence: number;
}

/**
 * ゲームフェーズを判定
 */
const determineGamePhase = (board: Board): GamePhaseInfo => {
  const counts = countPieces(board);
  const totalPieces = counts.black + counts.white;
  const progressPercentage = (totalPieces / 64) * 100;

  let phase: 'early' | 'mid' | 'late';
  if (totalPieces < GAME_PHASE_CONSTANTS.EARLY_GAME_THRESHOLD) {
    phase = 'early';
  } else if (totalPieces < GAME_PHASE_CONSTANTS.MID_GAME_THRESHOLD) {
    phase = 'mid';
  } else {
    phase = 'late';
  }

  return {
    phase,
    totalPieces,
    progressPercentage,
  };
};

/**
 * 評価要素から詳細な分析データを生成
 */
const createEvaluationComponent = (
  evaluationFunction: (board: Board) => EvaluationScore,
  board: Board,
  player: Player,
  weight: number
): EvaluationComponent => {
  const score = evaluationFunction(board) as number;
  const playerAdvantage = player === 'black' ? score < 0 : score > 0;

  // 生の値を計算（機動力の例）
  let rawPlayerValue = 0;
  let rawOpponentValue = 0;

  if (evaluationFunction === evaluateMobility) {
    const mobility = evaluateMobility(board) as number;
    // 機動力の生の値を逆算（近似）
    const totalMobility = Math.abs(mobility) + 100;
    rawPlayerValue =
      player === 'black'
        ? mobility < 0
          ? totalMobility * 0.6
          : totalMobility * 0.4
        : mobility > 0
          ? totalMobility * 0.6
          : totalMobility * 0.4;
    rawOpponentValue = totalMobility - rawPlayerValue;
  } else if (evaluationFunction === evaluateStableDiscs) {
    const stability = evaluateStableDiscs(board) as number;
    const totalStability = Math.abs(stability) + 100;
    rawPlayerValue =
      player === 'black'
        ? stability < 0
          ? totalStability * 0.6
          : totalStability * 0.4
        : stability > 0
          ? totalStability * 0.6
          : totalStability * 0.4;
    rawOpponentValue = totalStability - rawPlayerValue;
  } else if (evaluationFunction === evaluatePieceCount) {
    const counts = countPieces(board);
    rawPlayerValue = player === 'black' ? counts.black : counts.white;
    rawOpponentValue = player === 'black' ? counts.white : counts.black;
  } else if (evaluationFunction === evaluatePotentialMobilityScore) {
    const potential = evaluatePotentialMobilityScore(board) as number;
    const totalPotential = Math.abs(potential) + 100;
    rawPlayerValue =
      player === 'black'
        ? potential < 0
          ? totalPotential * 0.6
          : totalPotential * 0.4
        : potential > 0
          ? totalPotential * 0.6
          : totalPotential * 0.4;
    rawOpponentValue = totalPotential - rawPlayerValue;
  }

  return {
    score,
    playerAdvantage,
    rawPlayerValue,
    rawOpponentValue,
    weight,
  };
};

/**
 * 統合評価を実行
 */
export const performUnifiedEvaluation = (
  board: Board,
  player: Player,
  searchDepth?: number,
  searchScore?: number
): UnifiedEvaluation => {
  const gamePhase = determineGamePhase(board);

  // ゲームフェーズに応じた重み取得
  let weights: {
    MOBILITY?: number;
    STABILITY: number;
    PIECE_COUNT: number;
    POSITION?: number;
  };
  switch (gamePhase.phase) {
    case 'early':
      weights = GAME_PHASE_CONSTANTS.EARLY_GAME_WEIGHTS;
      break;
    case 'mid':
      weights = GAME_PHASE_CONSTANTS.MID_GAME_WEIGHTS;
      break;
    case 'late':
      weights = GAME_PHASE_CONSTANTS.LATE_GAME_WEIGHTS;
      break;
  }

  // 各評価要素の詳細分析
  const components = {
    mobility: createEvaluationComponent(evaluateMobility, board, player, weights.MOBILITY || 0),
    stability: createEvaluationComponent(evaluateStableDiscs, board, player, weights.STABILITY),
    position: createEvaluationComponent(
      evaluatePotentialMobilityScore,
      board,
      player,
      weights.POSITION || 0
    ),
    pieceCount: createEvaluationComponent(evaluatePieceCount, board, player, weights.PIECE_COUNT),
  };

  // 総合スコア計算
  let totalScore = 0;
  if (gamePhase.phase === 'early') {
    totalScore =
      components.mobility.score * components.mobility.weight +
      components.position.score * components.position.weight +
      components.stability.score * components.stability.weight;
  } else if (gamePhase.phase === 'mid') {
    totalScore =
      components.mobility.score * components.mobility.weight +
      components.position.score * components.position.weight +
      components.stability.score * components.stability.weight +
      components.pieceCount.score * components.pieceCount.weight;
  } else {
    totalScore =
      components.stability.score * components.stability.weight +
      components.pieceCount.score * components.pieceCount.weight +
      components.position.score * components.position.weight;
  }

  // 探索スコアがある場合は優先
  if (searchScore !== undefined) {
    totalScore = searchScore;
  }

  // 信頼度計算（探索深度やデータの整合性に基づく）
  let confidence = 0.7; // ベース信頼度
  if (searchDepth && searchDepth > 0) {
    confidence = Math.min(0.95, 0.7 + searchDepth * 0.05);
  }

  return {
    totalScore,
    gamePhase,
    components,
    searchDepth,
    searchScore,
    confidence,
  };
};

/**
 * 統合評価に基づく盤面分析の説明生成
 */
export const generateEvaluationExplanation = (
  evaluation: UnifiedEvaluation,
  player: Player
): string[] => {
  const explanations: string[] = [];
  const isPlayerBlack = player === 'black';

  // 総合評価 - プレイヤー視点での符号変換
  // 評価値：マイナス=黒有利、プラス=白有利
  // プレイヤー有利 = (黒プレイヤーかつマイナススコア) または (白プレイヤーかつプラススコア)
  const playerViewScore = isPlayerBlack ? evaluation.totalScore : -evaluation.totalScore;
  const totalAdvantage = playerViewScore < 0; // プレイヤー視点で負の値なら有利
  const scoreAbs = Math.abs(playerViewScore);

  if (scoreAbs > 30) {
    explanations.push(totalAdvantage ? '✓ 総合的に大きく有利' : '× 総合的に大きく不利');
  } else if (scoreAbs > 10) {
    explanations.push(totalAdvantage ? '✓ 総合的に有利' : '× 総合的に不利');
  } else {
    explanations.push('- 総合的に互角');
  }

  // 機動力分析
  if (evaluation.components.mobility.weight > 0) {
    const mobility = evaluation.components.mobility;
    if (mobility.playerAdvantage && Math.abs(mobility.score) > 15) {
      explanations.push(
        `✓ 着手可能数で優位（約${Math.round(mobility.rawPlayerValue)}手 vs ${Math.round(mobility.rawOpponentValue)}手）`
      );
    } else if (!mobility.playerAdvantage && Math.abs(mobility.score) > 15) {
      explanations.push(
        `× 着手可能数で劣勢（約${Math.round(mobility.rawPlayerValue)}手 vs ${Math.round(mobility.rawOpponentValue)}手）`
      );
    } else if (Math.abs(mobility.score) > 5) {
      explanations.push(
        `- 着手可能数は互角（約${Math.round(mobility.rawPlayerValue)}手 vs ${Math.round(mobility.rawOpponentValue)}手）`
      );
    }
  }

  // 安定性分析
  if (evaluation.components.stability.weight > 0) {
    const stability = evaluation.components.stability;
    if (stability.playerAdvantage && Math.abs(stability.score) > 10) {
      explanations.push(
        `✓ 確定石で優位（約${Math.round(stability.rawPlayerValue)}個 vs ${Math.round(stability.rawOpponentValue)}個）`
      );
    } else if (!stability.playerAdvantage && Math.abs(stability.score) > 10) {
      explanations.push(
        `× 確定石で劣勢（約${Math.round(stability.rawPlayerValue)}個 vs ${Math.round(stability.rawOpponentValue)}個）`
      );
    } else if (Math.abs(stability.score) > 3) {
      explanations.push(
        `- 確定石は互角（約${Math.round(stability.rawPlayerValue)}個 vs ${Math.round(stability.rawOpponentValue)}個）`
      );
    }
  }

  // 石数分析（終盤重要）
  if (evaluation.gamePhase.phase === 'late' && evaluation.components.pieceCount.weight > 0) {
    const pieces = evaluation.components.pieceCount;
    if (pieces.playerAdvantage && Math.abs(pieces.score) > 5) {
      explanations.push(
        `✓ 石数で優位（${Math.round(pieces.rawPlayerValue)}個 vs ${Math.round(pieces.rawOpponentValue)}個）`
      );
    } else if (!pieces.playerAdvantage && Math.abs(pieces.score) > 5) {
      explanations.push(
        `× 石数で劣勢（${Math.round(pieces.rawPlayerValue)}個 vs ${Math.round(pieces.rawOpponentValue)}個）`
      );
    }
  }

  // 探索結果の説明
  if (evaluation.searchScore !== undefined && evaluation.searchDepth) {
    explanations.push(
      `📊 ${evaluation.searchDepth}手読み結果を反映（信頼度: ${Math.round(evaluation.confidence * 100)}%）`
    );
  }

  // ゲームフェーズの説明
  explanations.push(
    `🎯 ${evaluation.gamePhase.phase === 'early' ? '序盤' : evaluation.gamePhase.phase === 'mid' ? '中盤' : '終盤'}戦略で評価`
  );

  return explanations;
};
