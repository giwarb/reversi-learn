import type { Board, Player, Position } from '../game/types';
import { findBestMove, findBestMoveIterativeDeepening } from './minimax';
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
    if (this.config.useIterativeDeepening) {
      return findBestMoveIterativeDeepening(
        board,
        player,
        this.config.maxDepth,
        this.config.timeLimitMs || 5000
      );
    }
    return findBestMove(board, player, this.config.maxDepth);
  }

  setDepth(depth: number): void {
    this.config.maxDepth = Math.max(1, Math.min(depth, 10));
  }

  getDepth(): number {
    return this.config.maxDepth;
  }

  setIterativeDeepening(enabled: boolean): void {
    this.config.useIterativeDeepening = enabled;
  }

  getIterativeDeepening(): boolean {
    return this.config.useIterativeDeepening || false;
  }

  setTimeLimit(timeLimitMs: number): void {
    this.config.timeLimitMs = Math.max(100, Math.min(timeLimitMs, 30000));
  }

  getTimeLimit(): number {
    return this.config.timeLimitMs || 5000;
  }
}
