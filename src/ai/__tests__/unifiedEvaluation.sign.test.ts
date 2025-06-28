import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../../game/board';
import type { Board } from '../../game/types';
import { generateEvaluationExplanation, performUnifiedEvaluation } from '../unifiedEvaluation';

describe('統合評価システム - 符号変換テスト', () => {
  describe('プレイヤー視点での符号変換', () => {
    it('黒プレイヤー：負のスコアで有利判定', () => {
      const board = createInitialBoard();
      // 負のスコア（黒有利）をシミュレート
      const evaluation = performUnifiedEvaluation(board, 'black', 3, -20);
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      // 黒プレイヤーにとって-20は有利なので、有利な説明が含まれるべき
      const hasAdvantageExplanation = explanations.some(
        (exp) => exp.includes('✓') && exp.includes('有利')
      );
      expect(hasAdvantageExplanation).toBe(true);

      // 「不利」な説明は含まれないべき
      const hasDisadvantageExplanation = explanations.some(
        (exp) => exp.includes('×') && exp.includes('不利')
      );
      expect(hasDisadvantageExplanation).toBe(false);
    });

    it('黒プレイヤー：正のスコアで不利判定', () => {
      const board = createInitialBoard();
      // 正のスコア（白有利）をシミュレート
      const evaluation = performUnifiedEvaluation(board, 'black', 3, 20);
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      // 黒プレイヤーにとって+20は不利なので、不利な説明が含まれるべき
      const hasDisadvantageExplanation = explanations.some(
        (exp) => exp.includes('×') && exp.includes('不利')
      );
      expect(hasDisadvantageExplanation).toBe(true);

      // 「有利」な説明は含まれないべき
      const hasAdvantageExplanation = explanations.some(
        (exp) => exp.includes('✓') && exp.includes('有利')
      );
      expect(hasAdvantageExplanation).toBe(false);
    });

    it('白プレイヤー：正のスコアで有利判定', () => {
      const board = createInitialBoard();
      // 正のスコア（白有利）をシミュレート
      const evaluation = performUnifiedEvaluation(board, 'white', 3, 20);
      const explanations = generateEvaluationExplanation(evaluation, 'white');

      // 白プレイヤーにとって+20は有利なので、有利な説明が含まれるべき
      const hasAdvantageExplanation = explanations.some(
        (exp) => exp.includes('✓') && exp.includes('有利')
      );
      expect(hasAdvantageExplanation).toBe(true);

      // 「不利」な説明は含まれないべき
      const hasDisadvantageExplanation = explanations.some(
        (exp) => exp.includes('×') && exp.includes('不利')
      );
      expect(hasDisadvantageExplanation).toBe(false);
    });

    it('白プレイヤー：負のスコアで不利判定', () => {
      const board = createInitialBoard();
      // 負のスコア（黒有利）をシミュレート
      const evaluation = performUnifiedEvaluation(board, 'white', 3, -20);
      const explanations = generateEvaluationExplanation(evaluation, 'white');

      // 白プレイヤーにとって-20は不利なので、不利な説明が含まれるべき
      const hasDisadvantageExplanation = explanations.some(
        (exp) => exp.includes('×') && exp.includes('不利')
      );
      expect(hasDisadvantageExplanation).toBe(true);

      // 「有利」な説明は含まれないべき
      const hasAdvantageExplanation = explanations.some(
        (exp) => exp.includes('✓') && exp.includes('有利')
      );
      expect(hasAdvantageExplanation).toBe(false);
    });
  });

  describe('スコア絶対値による判定レベル', () => {
    it('大きなスコア差（50）で「大きく有利/不利」判定', () => {
      const board = createInitialBoard();

      // 黒プレイヤーで大きく有利
      const blackAdvantage = performUnifiedEvaluation(board, 'black', 3, -50);
      const blackExplanations = generateEvaluationExplanation(blackAdvantage, 'black');

      expect(blackExplanations.some((exp) => exp.includes('大きく') && exp.includes('有利'))).toBe(
        true
      );

      // 白プレイヤーで大きく不利
      const whiteDisadvantage = performUnifiedEvaluation(board, 'white', 3, -50);
      const whiteExplanations = generateEvaluationExplanation(whiteDisadvantage, 'white');

      expect(whiteExplanations.some((exp) => exp.includes('大きく') && exp.includes('不利'))).toBe(
        true
      );
    });

    it('中程度のスコア差（20）で「有利/不利」判定', () => {
      const board = createInitialBoard();

      const evaluation = performUnifiedEvaluation(board, 'black', 3, -20);
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      // 「非常に」は含まれず、「有利」が含まれる
      expect(explanations.some((exp) => exp.includes('非常に'))).toBe(false);
      expect(explanations.some((exp) => exp.includes('✓') && exp.includes('有利'))).toBe(true);
    });

    it('小さなスコア差（5）で「互角」判定', () => {
      const board = createInitialBoard();

      const evaluation = performUnifiedEvaluation(board, 'black', 3, -5);
      const explanations = generateEvaluationExplanation(evaluation, 'black');

      expect(explanations.some((exp) => exp.includes('互角'))).toBe(true);
    });
  });

  describe('評価値の一貫性', () => {
    it('同じ盤面で黒と白の評価が逆転する', () => {
      const board: Board = Array(8)
        .fill(null)
        .map(() => Array(8).fill(null));

      // 明確に黒有利な状況を作成
      board[0][0] = 'black'; // 角
      board[3][3] = 'black';
      board[3][4] = 'white';
      board[4][3] = 'white';
      board[4][4] = 'white';

      const blackEval = performUnifiedEvaluation(board, 'black', 3, -30);
      const whiteEval = performUnifiedEvaluation(board, 'white', 3, -30); // 同じ負のスコア

      const blackExplanations = generateEvaluationExplanation(blackEval, 'black');
      const whiteExplanations = generateEvaluationExplanation(whiteEval, 'white');

      // 黒は有利、白は不利と判定されるべき
      const blackHasAdvantage = blackExplanations.some(
        (exp) => exp.includes('✓') && exp.includes('有利')
      );
      const whiteHasDisadvantage = whiteExplanations.some(
        (exp) => exp.includes('×') && exp.includes('不利')
      );

      expect(blackHasAdvantage).toBe(true);
      expect(whiteHasDisadvantage).toBe(true);
    });
  });
});
