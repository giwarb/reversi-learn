import { describe, expect, it } from 'vitest';
import {
  AI_CONSTANTS,
  EVALUATION_CONSTANTS,
  GAME_PHASE_CONSTANTS,
  MOVE_QUALITY_CONSTANTS,
  UI_CONSTANTS,
} from './ai';

describe('AI Constants', () => {
  describe('AI_CONSTANTS', () => {
    it('has valid default time limit', () => {
      expect(AI_CONSTANTS.DEFAULT_TIME_LIMIT_MS).toBe(5000);
      expect(AI_CONSTANTS.DEFAULT_TIME_LIMIT_MS).toBeGreaterThan(0);
    });

    it('has valid minimum thinking time', () => {
      expect(AI_CONSTANTS.MIN_THINKING_TIME_MS).toBe(500);
      expect(AI_CONSTANTS.MIN_THINKING_TIME_MS).toBeGreaterThan(0);
    });
  });

  describe('EVALUATION_CONSTANTS', () => {
    it('has correct max and min scores', () => {
      expect(EVALUATION_CONSTANTS.MAX_SCORE).toBe(1000000);
      expect(EVALUATION_CONSTANTS.MIN_SCORE).toBe(-1000000);
      expect(EVALUATION_CONSTANTS.MAX_SCORE).toBeGreaterThan(EVALUATION_CONSTANTS.MIN_SCORE);
    });

    it('has valid normalized score range', () => {
      expect(EVALUATION_CONSTANTS.MAX_NORMALIZED_SCORE).toBe(200);
      expect(EVALUATION_CONSTANTS.MAX_NORMALIZED_SCORE).toBeGreaterThan(0);
    });
  });

  describe('GAME_PHASE_CONSTANTS', () => {
    it('has correct phase thresholds', () => {
      expect(GAME_PHASE_CONSTANTS.EARLY_GAME_THRESHOLD).toBe(20);
      expect(GAME_PHASE_CONSTANTS.MID_GAME_THRESHOLD).toBe(40);
      expect(GAME_PHASE_CONSTANTS.EARLY_GAME_THRESHOLD).toBeLessThan(
        GAME_PHASE_CONSTANTS.MID_GAME_THRESHOLD
      );
    });

    it('has valid evaluation weights', () => {
      const early = GAME_PHASE_CONSTANTS.EARLY_GAME_WEIGHTS;
      expect(early.MOBILITY).toBe(5);
      expect(early.STABILITY).toBe(2);
      expect(early.PIECE_COUNT).toBe(1);

      const mid = GAME_PHASE_CONSTANTS.MID_GAME_WEIGHTS;
      expect(mid.MOBILITY).toBe(3);
      expect(mid.STABILITY).toBe(1);
      expect(mid.PIECE_COUNT).toBe(3);
      expect(mid.POSITION).toBe(0.5);

      const late = GAME_PHASE_CONSTANTS.LATE_GAME_WEIGHTS;
      expect(late.PIECE_COUNT).toBe(1);
      expect(late.STABILITY).toBe(5);
      expect(late.POSITION).toBe(3);
    });
  });

  describe('MOVE_QUALITY_CONSTANTS', () => {
    it('has correct percentile thresholds', () => {
      expect(MOVE_QUALITY_CONSTANTS.BAD_MOVE_THRESHOLD).toBe(80);
      expect(MOVE_QUALITY_CONSTANTS.TERRIBLE_MOVE_THRESHOLD).toBe(20);
      expect(MOVE_QUALITY_CONSTANTS.SUGGEST_BETTER_THRESHOLD).toBe(50);

      expect(MOVE_QUALITY_CONSTANTS.TERRIBLE_MOVE_THRESHOLD).toBeLessThan(
        MOVE_QUALITY_CONSTANTS.SUGGEST_BETTER_THRESHOLD
      );
      expect(MOVE_QUALITY_CONSTANTS.SUGGEST_BETTER_THRESHOLD).toBeLessThan(
        MOVE_QUALITY_CONSTANTS.BAD_MOVE_THRESHOLD
      );
    });

    it('has valid score difference thresholds', () => {
      expect(MOVE_QUALITY_CONSTANTS.EVEN_GAME_THRESHOLD).toBe(5);
      expect(MOVE_QUALITY_CONSTANTS.SLIGHT_ADVANTAGE_THRESHOLD).toBe(15);
      expect(MOVE_QUALITY_CONSTANTS.CLEAR_ADVANTAGE_THRESHOLD).toBe(30);
    });
  });

  describe('UI_CONSTANTS', () => {
    it('has valid notification duration', () => {
      expect(UI_CONSTANTS.NOTIFICATION_DURATION_MS).toBe(2000);
      expect(UI_CONSTANTS.NOTIFICATION_DURATION_MS).toBeGreaterThan(0);
    });

    it('has correct AI level thresholds', () => {
      expect(UI_CONSTANTS.EASY_LEVEL_THRESHOLD).toBe(2);
      expect(UI_CONSTANTS.MEDIUM_LEVEL_THRESHOLD).toBe(4);
      expect(UI_CONSTANTS.EASY_LEVEL_THRESHOLD).toBeLessThan(UI_CONSTANTS.MEDIUM_LEVEL_THRESHOLD);
    });
  });
});
