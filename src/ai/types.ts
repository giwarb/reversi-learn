import type { Position } from '../game/types';

export interface MoveEvaluation {
  position: Position;
  score: number;
  depth: number;
}

export interface AIConfig {
  maxDepth: number;
  timeLimit?: number;
}
