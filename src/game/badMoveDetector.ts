import { ReversiAI } from '../ai/ai';
import { analyzeDetailedBadMove, type DetailedBadMoveAnalysis } from '../ai/badMoveAnalyzer';
import { findBestMove } from '../ai/minimax';
import { analyzeBadMove, compareMovesWithAI } from '../ai/moveAnalyzer';
import type { Board, GameState, Player, Position } from './types';

export interface BadMoveResult {
  isBadMove: boolean;
  playerMove: Position;
  aiRecommendation: Position | null;
  explanation: string;
  scoreDifference: number;
  detailedAnalysis?: DetailedBadMoveAnalysis;
  rank?: number; // 順位
  totalMoves?: number; // 有効な手の総数
  percentile?: number; // パーセンタイル
}

export class BadMoveDetector {
  private ai: ReversiAI;
  private threshold: number;
  private percentileThreshold: number;

  constructor(aiDepth: number = 5, threshold: number = 50, percentileThreshold: number = 20) {
    this.ai = new ReversiAI({ maxDepth: aiDepth });
    this.threshold = threshold;
    this.percentileThreshold = percentileThreshold; // 上位20%以外は悪手
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

    // 悪手かどうかを判定（順位ベース）
    const isBadMove = analysis.isBadMove;

    // 詳細な分析を実行
    let detailedAnalysis: DetailedBadMoveAnalysis | undefined;
    if (isBadMove) {
      detailedAnalysis = analyzeDetailedBadMove(
        boardBeforeMove,
        playerMove,
        player,
        this.ai.getDepth()
      );
    }

    // 説明文を生成
    let explanation = '';

    // 順位情報を追加
    if (analysis.rank && analysis.totalMoves) {
      // 同率チェック（reasonsに同率情報が含まれているか）
      const isTied = analysis.reasons.some((r) => r.includes('位タイ'));
      if (isTied) {
        explanation = `この手は${analysis.totalMoves}手中${analysis.rank}位タイです`;
      } else {
        explanation = `この手は${analysis.totalMoves}手中${analysis.rank}位です`;
      }
      if (analysis.percentile) {
        explanation += `（上位${analysis.percentile.toFixed(0)}%）\n\n`;
      }
    }

    if (isBadMove && detailedAnalysis) {
      if (analysis.percentile && analysis.percentile < 20) {
        explanation += '大悪手です！\n\n';
      } else {
        explanation += '悪手です！\n\n';
      }

      // 具体的な影響を説明
      if (detailedAnalysis.impacts.length > 0) {
        explanation += '問題点：\n';
        detailedAnalysis.impacts.forEach((impact) => {
          explanation += `・${impact.description}\n`;
        });
        explanation += '\n';
      }

      // 将来の影響
      if (detailedAnalysis.futureConsequences.length > 0) {
        explanation += '結果として：\n';
        detailedAnalysis.futureConsequences.forEach((consequence) => {
          explanation += `・${consequence}\n`;
        });
        explanation += '\n';
      }

      // AIの推奨手
      if (aiRecommendation) {
        explanation += `AIの推奨手: (${aiRecommendation.row + 1}, ${aiRecommendation.col + 1})\n`;
        explanation += `評価値の差: ${detailedAnalysis.scoreDifference.toFixed(0)}点`;
      }
    } else if (analysis.percentile && analysis.percentile < 50) {
      explanation += 'より良い手がありました。\n\n';
      explanation += compareMovesWithAI(boardBeforeMove, playerMove, aiRecommendation, player);
    } else {
      explanation += compareMovesWithAI(boardBeforeMove, playerMove, aiRecommendation, player);
    }

    return {
      isBadMove,
      playerMove,
      aiRecommendation,
      explanation: explanation.trim(),
      scoreDifference: analysis.scoreDiff,
      detailedAnalysis,
      rank: analysis.rank,
      totalMoves: analysis.totalMoves,
      percentile: analysis.percentile,
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
