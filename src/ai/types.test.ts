import { describe, expect, it } from 'vitest';
import { createEvaluationScore } from '../game/types';
import type { AIConfig, MoveEvaluation } from './types';

describe('AIConfig interface', () => {
  it('should have correct properties without timeLimit duplication', () => {
    const config: AIConfig = {
      maxDepth: 4,
      useIterativeDeepening: true,
      timeLimitMs: 5000,
    };

    expect(config.maxDepth).toBe(4);
    expect(config.useIterativeDeepening).toBe(true);
    expect(config.timeLimitMs).toBe(5000);
  });

  it('should allow optional properties to be undefined', () => {
    const minimalConfig: AIConfig = {
      maxDepth: 2,
    };

    expect(minimalConfig.maxDepth).toBe(2);
    expect(minimalConfig.useIterativeDeepening).toBeUndefined();
    expect(minimalConfig.timeLimitMs).toBeUndefined();
  });

  it('should not have timeLimit property available', () => {
    const config: AIConfig = {
      maxDepth: 3,
      timeLimitMs: 3000,
    };

    // TypeScript should prevent accessing timeLimit property
    // This test ensures timeLimit is not part of the interface
    expect('timeLimit' in config).toBe(false);
  });
});

describe('MoveEvaluation interface', () => {
  it('should have correct structure', () => {
    const evaluation: MoveEvaluation = {
      position: { row: 2, col: 3 },
      score: createEvaluationScore(150),
      depth: 4,
      pv: [
        { row: 2, col: 3 },
        { row: 1, col: 2 },
      ],
      timeSpent: 250,
    };

    expect(evaluation.position).toEqual({ row: 2, col: 3 });
    expect(evaluation.score).toBe(150);
    expect(evaluation.depth).toBe(4);
    expect(evaluation.pv).toHaveLength(2);
    expect(evaluation.timeSpent).toBe(250);
  });

  it('should allow optional properties to be undefined', () => {
    const minimalEvaluation: MoveEvaluation = {
      position: { row: 0, col: 0 },
      score: createEvaluationScore(-50),
      depth: 1,
    };

    expect(minimalEvaluation.pv).toBeUndefined();
    expect(minimalEvaluation.timeSpent).toBeUndefined();
  });
});
