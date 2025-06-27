import type { EvaluationScore, Position } from '../game/types';

export interface MoveEvaluation {
  position: Position;
  score: EvaluationScore;
  depth: number;
  pv?: Position[]; // Principal Variation (最善手順)
  timeSpent?: number; // 探索に要した時間（ミリ秒）
}

export interface AIConfig {
  maxDepth: number;
  useIterativeDeepening?: boolean; // Iterative Deepeningの有効/無効
  timeLimitMs?: number; // 時間制限（ミリ秒）
}
