import type { Board, Player, Position } from '../game/types';
import { findBestMove } from './minimax';
import type { AIConfig, MoveEvaluation } from './types';

export class ReversiAI {
  private config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  getMove(board: Board, player: Player): Position | null {
    const evaluation = this.evaluateMove(board, player);
    return evaluation ? evaluation.position : null;
  }

  evaluateMove(board: Board, player: Player): MoveEvaluation | null {
    return findBestMove(board, player, this.config.maxDepth);
  }

  setDepth(depth: number): void {
    this.config.maxDepth = Math.max(1, Math.min(depth, 10));
  }

  getDepth(): number {
    return this.config.maxDepth;
  }
}
