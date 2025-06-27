import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../../game/board';
import type { Board } from '../../game/types';
import { generateEvaluationExplanation, performUnifiedEvaluation } from '../unifiedEvaluation';

describe('統合評価システム', () => {
  describe('performUnifiedEvaluation', () => {
    it('初期盤面で互角の評価を返す', () => {
      const board = createInitialBoard();
      const evaluation = performUnifiedEvaluation(board, 'black');

      expect(evaluation.totalScore).toBeCloseTo(0, 1);
      expect(evaluation.gamePhase.phase).toBe('early');
      expect(evaluation.confidence).toBeGreaterThan(0.5);
    });

    it('黒有利な盤面で黒に有利な評価を返す', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // 黒が角を取った状況
      board[0][0] = 'black';
      board[0][1] = 'black';
      board[1][0] = 'black';
      board[1][1] = 'black';

      // 白石を少し配置
      board[3][3] = 'white';
      board[3][4] = 'white';
      board[4][3] = 'white';
      board[4][4] = 'white';

      const evaluation = performUnifiedEvaluation(board, 'black');

      expect(evaluation.totalScore).toBeLessThan(0); // 黒有利
      expect(evaluation.components.stability.playerAdvantage).toBe(true);
    });

    it('白有利な盤面で白に有利な評価を返す', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // 白が角を取った状況
      board[0][0] = 'white';
      board[0][1] = 'white';
      board[1][0] = 'white';
      board[1][1] = 'white';

      // 黒石を少し配置
      board[3][3] = 'black';
      board[3][4] = 'black';
      board[4][3] = 'black';
      board[4][4] = 'black';

      const evaluation = performUnifiedEvaluation(board, 'white');

      expect(evaluation.totalScore).toBeGreaterThan(0); // 白有利
      expect(evaluation.components.stability.playerAdvantage).toBe(true);
    });

    it('探索深度を指定した場合、より高い信頼度を返す', () => {
      const board = createInitialBoard();
      const evaluationWithoutSearch = performUnifiedEvaluation(board, 'black');
      const evaluationWithSearch = performUnifiedEvaluation(board, 'black', 3, -10);

      expect(evaluationWithSearch.confidence).toBeGreaterThan(evaluationWithoutSearch.confidence);
      expect(evaluationWithSearch.searchDepth).toBe(3);
      expect(evaluationWithSearch.searchScore).toBe(-10);
      expect(evaluationWithSearch.totalScore).toBe(-10); // 探索スコアが優先される
    });

    it('ゲームフェーズを正しく判定する', () => {
      // 序盤
      const earlyBoard = createInitialBoard();
      const earlyEval = performUnifiedEvaluation(earlyBoard, 'black');
      expect(earlyEval.gamePhase.phase).toBe('early');

      // 終盤（多くの石が配置された状況）
      const lateBoard: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill('black'));
      // 一部を白石に
      for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
          lateBoard[i][j] = 'white';
        }
      }
      const lateEval = performUnifiedEvaluation(lateBoard, 'black');
      expect(lateEval.gamePhase.phase).toBe('late');
    });
  });

  describe('generateEvaluationExplanation', () => {
    it('黒有利な評価で適切な説明を生成する', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // 黒有利な状況を作成
      board[0][0] = 'black'; // 角
      board[3][3] = 'black';
      board[3][4] = 'black';
      board[4][3] = 'black';
      board[4][4] = 'black';
      board[2][2] = 'white';
      board[2][3] = 'white';

      const evaluation = performUnifiedEvaluation(board, 'black');
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      expect(explanations).toBeInstanceOf(Array);
      expect(explanations.length).toBeGreaterThan(0);

      // 有利な状況を示す説明が含まれることを確認
      const hasPositiveExplanation = explanations.some(
        (exp) => exp.includes('✓') || exp.includes('有利')
      );
      expect(hasPositiveExplanation).toBe(true);
    });

    it('白有利な評価で適切な説明を生成する', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // 白有利な状況を作成
      board[0][0] = 'white'; // 角
      board[3][3] = 'white';
      board[3][4] = 'white';
      board[4][3] = 'white';
      board[4][4] = 'white';
      board[2][2] = 'black';
      board[2][3] = 'black';

      const evaluation = performUnifiedEvaluation(board, 'white');
      const explanations = generateEvaluationExplanation(evaluation, 'white');

      expect(explanations).toBeInstanceOf(Array);
      expect(explanations.length).toBeGreaterThan(0);

      // 有利な状況を示す説明が含まれることを確認
      const hasPositiveExplanation = explanations.some(
        (exp) => exp.includes('✓') || exp.includes('有利')
      );
      expect(hasPositiveExplanation).toBe(true);
    });

    it('探索結果の説明を含む', () => {
      const board = createInitialBoard();
      const evaluation = performUnifiedEvaluation(board, 'black', 4, -15);
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      const hasSearchExplanation = explanations.some(
        (exp) => exp.includes('手読み') && exp.includes('信頼度')
      );
      expect(hasSearchExplanation).toBe(true);
    });

    it('ゲームフェーズの説明を含む', () => {
      const board = createInitialBoard();
      const evaluation = performUnifiedEvaluation(board, 'black');
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      const hasPhaseExplanation = explanations.some(
        (exp) => exp.includes('序盤') || exp.includes('中盤') || exp.includes('終盤')
      );
      expect(hasPhaseExplanation).toBe(true);
    });
  });

  describe('評価要素の整合性', () => {
    it('各評価要素が適切な範囲内の値を返す', () => {
      const board = createInitialBoard();
      const evaluation = performUnifiedEvaluation(board, 'black');

      // スコアは-100から100の範囲内
      expect(evaluation.components.mobility.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.components.mobility.score).toBeLessThanOrEqual(100);

      expect(evaluation.components.stability.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.components.stability.score).toBeLessThanOrEqual(100);

      expect(evaluation.components.pieceCount.score).toBeGreaterThanOrEqual(-100);
      expect(evaluation.components.pieceCount.score).toBeLessThanOrEqual(100);

      // 重みが設定されている
      expect(evaluation.components.mobility.weight).toBeGreaterThan(0);
      expect(evaluation.components.stability.weight).toBeGreaterThan(0);
    });

    it('プレイヤー有利フラグが適切に設定される', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // 黒有利な状況
      board[0][0] = 'black';
      board[3][3] = 'black';
      board[3][4] = 'black';
      board[4][3] = 'white';

      const blackEvaluation = performUnifiedEvaluation(board, 'black');
      const whiteEvaluation = performUnifiedEvaluation(board, 'white');

      // 同じ盤面でもプレイヤーによって有利フラグが変わる
      if (blackEvaluation.components.stability.score !== 0) {
        expect(blackEvaluation.components.stability.playerAdvantage).not.toBe(
          whiteEvaluation.components.stability.playerAdvantage
        );
      }
    });
  });
});
