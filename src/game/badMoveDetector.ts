import { ReversiAI } from '../ai/ai';
import { analyzeDetailedBadMove, type DetailedBadMoveAnalysis } from '../ai/badMoveAnalyzer';
import { findBestMove } from '../ai/minimax';
import { analyzeBadMove, compareMovesWithAI } from '../ai/moveAnalyzer';
import { getNormalizedScores } from '../utils/evaluationNormalizer';
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
  allMoves?: Array<{ position: Position; score: number; depth: number }>; // 全ての合法手とその評価値
}

export class BadMoveDetector {
  private ai: ReversiAI;
  private threshold: number;

  constructor(aiDepth: number = 5, threshold: number = 50) {
    this.ai = new ReversiAI({ maxDepth: aiDepth });
    this.threshold = threshold;
  }

  detectBadMove(
    boardBeforeMove: Board,
    playerMove: Position,
    player: Player,
    playerColor: Player
  ): BadMoveResult {
    // AIの推奨手を取得（一度だけ計算）
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

    // 詳細な分析を実行（aiEvaluationを渡して重複計算を避ける）
    const detailedAnalysis = analyzeDetailedBadMove(
      boardBeforeMove,
      playerMove,
      player,
      this.ai.getDepth(),
      aiEvaluation // 既に計算済みの結果を渡す
    );

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

    if (isBadMove) {
      if (analysis.percentile && analysis.percentile < 20) {
        explanation += '大悪手です！\n\n';
      } else {
        explanation += '悪手です！\n\n';
      }

      // 具体的な影響を説明（必ず表示）
      if (detailedAnalysis.impacts.length > 0) {
        explanation += '問題点：\n';
        detailedAnalysis.impacts.forEach((impact) => {
          explanation += `・${impact.description}\n`;
        });
        explanation += '\n';
      } else {
        // 具体的な影響が検出されない場合でも理由を表示
        explanation += '問題点：\n';
        explanation += `・この手は評価値が低く、より良い選択肢があります\n`;
        if (analysis.scoreDiff > 0) {
          explanation += `・AIの推奨手より${analysis.scoreDiff.toFixed(0)}点劣っています\n`;
        }
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

      // AIの推奨手（必ず表示）
      if (aiRecommendation) {
        const colLetter = String.fromCharCode('a'.charCodeAt(0) + aiRecommendation.col);
        const rowNumber = aiRecommendation.row + 1;
        explanation += `AIの推奨手: ${colLetter}${rowNumber}\n`;
        explanation += `評価値の差: ${detailedAnalysis.scoreDifference.toFixed(0)}点\n\n`;

        // 相手の応手による評価値変化
        if (detailedAnalysis.opponentBestResponse) {
          const oppColLetter = String.fromCharCode(
            'a'.charCodeAt(0) + detailedAnalysis.opponentBestResponse.col
          );
          const oppRowNumber = detailedAnalysis.opponentBestResponse.row + 1;

          // プレイヤーの色はplayerColor引数から取得

          // あなたの手の評価値（正規化）
          const playerMoveScores = getNormalizedScores(
            playerColor === 'black'
              ? detailedAnalysis.evaluationAfterPlayerMove
              : -detailedAnalysis.evaluationAfterPlayerMove,
            playerColor === 'white'
              ? detailedAnalysis.evaluationAfterPlayerMove
              : -detailedAnalysis.evaluationAfterPlayerMove
          );
          const afterOpponentScores = getNormalizedScores(
            playerColor === 'black'
              ? detailedAnalysis.evaluationAfterOpponentResponse
              : -detailedAnalysis.evaluationAfterOpponentResponse,
            playerColor === 'white'
              ? detailedAnalysis.evaluationAfterOpponentResponse
              : -detailedAnalysis.evaluationAfterOpponentResponse
          );

          // 推奨手の評価値（正規化）
          const bestMoveInitialScore =
            detailedAnalysis.evaluationAfterPlayerMove + detailedAnalysis.scoreDifference;
          const bestMoveScores = getNormalizedScores(
            playerColor === 'black' ? bestMoveInitialScore : -bestMoveInitialScore,
            playerColor === 'white' ? bestMoveInitialScore : -bestMoveInitialScore
          );
          const bestMoveAfterScores = getNormalizedScores(
            playerColor === 'black'
              ? detailedAnalysis.bestMoveEvaluationAfterOpponent
              : -detailedAnalysis.bestMoveEvaluationAfterOpponent,
            playerColor === 'white'
              ? detailedAnalysis.bestMoveEvaluationAfterOpponent
              : -detailedAnalysis.bestMoveEvaluationAfterOpponent
          );

          const playerScore =
            playerColor === 'black' ? playerMoveScores.blackScore : playerMoveScores.whiteScore;
          const aiScore =
            playerColor === 'black' ? playerMoveScores.whiteScore : playerMoveScores.blackScore;
          const playerAfterScore =
            playerColor === 'black'
              ? afterOpponentScores.blackScore
              : afterOpponentScores.whiteScore;
          const aiAfterScore =
            playerColor === 'black'
              ? afterOpponentScores.whiteScore
              : afterOpponentScores.blackScore;

          const bestPlayerScore =
            playerColor === 'black' ? bestMoveScores.blackScore : bestMoveScores.whiteScore;
          const bestAiScore =
            playerColor === 'black' ? bestMoveScores.whiteScore : bestMoveScores.blackScore;
          const bestPlayerAfterScore =
            playerColor === 'black'
              ? bestMoveAfterScores.blackScore
              : bestMoveAfterScores.whiteScore;
          const bestAiAfterScore =
            playerColor === 'black'
              ? bestMoveAfterScores.whiteScore
              : bestMoveAfterScores.blackScore;

          explanation += `相手の最善応手: ${oppColLetter}${oppRowNumber}\n`;
          explanation += `あなたの手: ${playerScore.toFixed(1)} vs ${aiScore.toFixed(1)} → ${playerAfterScore.toFixed(1)} vs ${aiAfterScore.toFixed(1)}\n`;
          explanation += `推奨手なら: ${bestPlayerScore.toFixed(1)} vs ${bestAiScore.toFixed(1)} → ${bestPlayerAfterScore.toFixed(1)} vs ${bestAiAfterScore.toFixed(1)}`;
        }
      }
    } else if (analysis.percentile && analysis.percentile < 50) {
      explanation += 'より良い手がありました。\n\n';

      // 50パーセンタイル未満でも問題点を表示
      if (detailedAnalysis.impacts.length > 0) {
        explanation += '注意点：\n';
        detailedAnalysis.impacts.forEach((impact) => {
          explanation += `・${impact.description}\n`;
        });
        explanation += '\n';
      }

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
      allMoves: analysis.allMoves,
    };
  }

  analyzeGameHistory(gameState: GameState, playerColor: Player): BadMoveResult[] {
    const results: BadMoveResult[] = [];
    const currentBoard = gameState.board;
    let currentPlayer: Player = 'black';

    // ゲーム履歴を再現しながら各手を分析
    for (const move of gameState.moveHistory) {
      const result = this.detectBadMove(currentBoard, move, currentPlayer, playerColor);
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
