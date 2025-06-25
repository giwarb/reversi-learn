import { describe, expect, it } from 'vitest';
import { getAdvantageText, getNormalizedScores, normalizeEvaluation } from './evaluationNormalizer';

describe('evaluationNormalizer', () => {
  describe('normalizeEvaluation', () => {
    it('均衡状態（0）を50に変換', () => {
      expect(normalizeEvaluation(0)).toBe(50);
    });

    it('黒有利（マイナス値）の場合は0-50の範囲', () => {
      const score = normalizeEvaluation(-50); // 黒有利
      expect(score).toBeLessThan(50);
      expect(score).toBeGreaterThanOrEqual(0);
    });

    it('最大値と最小値を0-100の範囲内に収める', () => {
      expect(normalizeEvaluation(200)).toBe(100); // 白優勢
      expect(normalizeEvaluation(-200)).toBe(0); // 黒優勢
    });
  });

  describe('getNormalizedScores', () => {
    it('均衡状態では両者とも50', () => {
      const { blackScore, whiteScore } = getNormalizedScores(0);
      expect(blackScore).toBe(50);
      expect(whiteScore).toBe(50);
    });

    it('黒が有利な場合の正規化', () => {
      const { blackScore, whiteScore } = getNormalizedScores(-50); // 黒有利
      expect(blackScore).toBeGreaterThan(50);
      expect(whiteScore).toBeLessThan(50);
      // スコアの合計は常に100
      expect(blackScore + whiteScore).toBe(100);
    });

    it('白が有利な場合の正規化', () => {
      const { blackScore, whiteScore } = getNormalizedScores(50); // 白有利
      expect(blackScore).toBeLessThan(50);
      expect(whiteScore).toBeGreaterThan(50);
      expect(blackScore + whiteScore).toBe(100);
    });
  });

  describe('getAdvantageText', () => {
    it('差が5未満の場合は互角', () => {
      expect(getAdvantageText(52, 48)).toBe('互角');
      expect(getAdvantageText(48, 52)).toBe('互角');
    });

    it('差が5-15の場合はやや有利', () => {
      expect(getAdvantageText(57, 43)).toBe('黒やや有利');
      expect(getAdvantageText(43, 57)).toBe('白やや有利');
    });

    it('差が15-30の場合は有利', () => {
      expect(getAdvantageText(60, 40)).toBe('黒有利');
      expect(getAdvantageText(40, 60)).toBe('白有利');
    });

    it('差が30以上の場合は優勢', () => {
      expect(getAdvantageText(85, 15)).toBe('黒優勢');
      expect(getAdvantageText(15, 85)).toBe('白優勢');
    });
  });
});
