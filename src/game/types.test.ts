import { describe, expect, it } from 'vitest';
import {
  addEvaluationScores,
  createEvaluationScore,
  createNormalizedScore,
  createPieceCount,
  MAX_EVALUATION_SCORE,
  MAX_NORMALIZED_SCORE,
  MAX_PIECE_COUNT,
  MIN_EVALUATION_SCORE,
  MIN_NORMALIZED_SCORE,
  MIN_PIECE_COUNT,
  negateEvaluationScore,
} from './types';

describe('EvaluationScore', () => {
  describe('createEvaluationScore', () => {
    it('should create valid evaluation scores', () => {
      const score = createEvaluationScore(500);
      expect(score).toBe(500);
    });

    it('should throw error for values below minimum', () => {
      expect(() => createEvaluationScore(MIN_EVALUATION_SCORE - 1)).toThrow(
        'EvaluationScore must be between -1000000 and 1000000'
      );
    });

    it('should throw error for values above maximum', () => {
      expect(() => createEvaluationScore(MAX_EVALUATION_SCORE + 1)).toThrow(
        'EvaluationScore must be between -1000000 and 1000000'
      );
    });

    it('should accept boundary values', () => {
      expect(() => createEvaluationScore(MIN_EVALUATION_SCORE)).not.toThrow();
      expect(() => createEvaluationScore(MAX_EVALUATION_SCORE)).not.toThrow();
    });
  });

  describe('addEvaluationScores', () => {
    it('should add two evaluation scores', () => {
      const score1 = createEvaluationScore(100);
      const score2 = createEvaluationScore(200);
      const result = addEvaluationScores(score1, score2);
      expect(result).toBe(300);
    });

    it('should handle negative scores', () => {
      const score1 = createEvaluationScore(-100);
      const score2 = createEvaluationScore(50);
      const result = addEvaluationScores(score1, score2);
      expect(result).toBe(-50);
    });
  });

  describe('negateEvaluationScore', () => {
    it('should negate positive score', () => {
      const score = createEvaluationScore(150);
      const result = negateEvaluationScore(score);
      expect(result).toBe(-150);
    });

    it('should negate negative score', () => {
      const score = createEvaluationScore(-75);
      const result = negateEvaluationScore(score);
      expect(result).toBe(75);
    });

    it('should handle zero', () => {
      const score = createEvaluationScore(0);
      const result = negateEvaluationScore(score);
      expect(result).toBe(0);
    });
  });
});

describe('NormalizedScore', () => {
  describe('createNormalizedScore', () => {
    it('should create valid normalized scores', () => {
      const score = createNormalizedScore(50);
      expect(score).toBe(50);
    });

    it('should throw error for values below minimum', () => {
      expect(() => createNormalizedScore(MIN_NORMALIZED_SCORE - 1)).toThrow(
        'NormalizedScore must be between 0 and 100'
      );
    });

    it('should throw error for values above maximum', () => {
      expect(() => createNormalizedScore(MAX_NORMALIZED_SCORE + 1)).toThrow(
        'NormalizedScore must be between 0 and 100'
      );
    });

    it('should accept boundary values', () => {
      expect(() => createNormalizedScore(MIN_NORMALIZED_SCORE)).not.toThrow();
      expect(() => createNormalizedScore(MAX_NORMALIZED_SCORE)).not.toThrow();
    });
  });
});

describe('PieceCount', () => {
  describe('createPieceCount', () => {
    it('should create valid piece counts', () => {
      const count = createPieceCount(32);
      expect(count).toBe(32);
    });

    it('should throw error for negative values', () => {
      expect(() => createPieceCount(-1)).toThrow('PieceCount must be between 0 and 64');
    });

    it('should throw error for values above maximum', () => {
      expect(() => createPieceCount(MAX_PIECE_COUNT + 1)).toThrow(
        'PieceCount must be between 0 and 64'
      );
    });

    it('should accept boundary values', () => {
      expect(() => createPieceCount(MIN_PIECE_COUNT)).not.toThrow();
      expect(() => createPieceCount(MAX_PIECE_COUNT)).not.toThrow();
    });
  });
});
