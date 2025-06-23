import { ReversiAI } from '../ai/ai';
import { findBestMove } from '../ai/minimax';
import { analyzeBadMove, compareMovesWithAI } from '../ai/moveAnalyzer';
import type { Board, GameState, Player, Position } from './types';

export interface BadMoveResult {
  isBadMove: boolean;
  playerMove: Position;
  aiRecommendation: Position | null;
  explanation: string;
  scoreDifference: number;
}

export class BadMoveDetector {
  private ai: ReversiAI;
  private threshold: number;

  constructor(aiDepth: number = 5, threshold: number = 50) {
    this.ai = new ReversiAI({ maxDepth: aiDepth });
    this.threshold = threshold;
  }

  detectBadMove(boardBeforeMove: Board, playerMove: Position, player: Player): BadMoveResult {
    // AIの推奨手を取得
    const aiEvaluation = findBestMove(boardBeforeMove, player, this.ai.getDepth());
    const aiRecommendation = aiEvaluation ? aiEvaluation.position : null;

    // プレイヤーの手を分析
    const analysis = analyzeBadMove(boardBeforeMove, playerMove, player, this.ai.getDepth());

    if (!analysis) {
      return {
        isBadMove: false,
        playerMove,
        aiRecommendation: null,
        explanation: '無効な手です。',
        scoreDifference: 0,
      };
    }

    // 悪手かどうかを判定
    const isBadMove = analysis.scoreDiff > this.threshold;

    // 説明文を生成
    let explanation = '';
    if (isBadMove) {
      explanation = '悪手です！\n\n';
      explanation += compareMovesWithAI(boardBeforeMove, playerMove, aiRecommendation, player);

      if (analysis.reasons.length > 0) {
        explanation += '\n\n問題点：\n';
        analysis.reasons.forEach((reason) => {
          explanation += `・${reason}\n`;
        });
      }
    } else if (analysis.scoreDiff > this.threshold / 2) {
      explanation = 'より良い手がありました。\n\n';
      explanation += compareMovesWithAI(boardBeforeMove, playerMove, aiRecommendation, player);
    } else {
      explanation = compareMovesWithAI(boardBeforeMove, playerMove, aiRecommendation, player);
    }

    return {
      isBadMove,
      playerMove,
      aiRecommendation,
      explanation: explanation.trim(),
      scoreDifference: analysis.scoreDiff,
    };
  }

  analyzeGameHistory(gameState: GameState): BadMoveResult[] {
    const results: BadMoveResult[] = [];
    const currentBoard = gameState.board;
    let currentPlayer: Player = 'black';

    // ゲーム履歴を再現しながら各手を分析
    for (const move of gameState.moveHistory) {
      const result = this.detectBadMove(currentBoard, move, currentPlayer);
      results.push(result);

      // 次の状態へ
      currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
    }

    return results;
  }

  setThreshold(threshold: number): void {
    this.threshold = Math.max(0, threshold);
  }

  getThreshold(): number {
    return this.threshold;
  }

  setAIDepth(depth: number): void {
    this.ai.setDepth(depth);
  }

  getAIDepth(): number {
    return this.ai.getDepth();
  }
}
