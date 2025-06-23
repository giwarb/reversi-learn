import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';
import {
  analyzeMove,
  explainEvaluation,
  isCorner,
  isCSquare,
  isEdge,
  isXSquare,
} from './evaluationReasons';

describe('位置判定関数', () => {
  it('isCorner が角を正しく判定する', () => {
    expect(isCorner({ row: 0, col: 0 })).toBe(true);
    expect(isCorner({ row: 0, col: 7 })).toBe(true);
    expect(isCorner({ row: 7, col: 0 })).toBe(true);
    expect(isCorner({ row: 7, col: 7 })).toBe(true);
    expect(isCorner({ row: 3, col: 3 })).toBe(false);
  });

  it('isEdge が辺を正しく判定する', () => {
    expect(isEdge({ row: 0, col: 3 })).toBe(true);
    expect(isEdge({ row: 7, col: 3 })).toBe(true);
    expect(isEdge({ row: 3, col: 0 })).toBe(true);
    expect(isEdge({ row: 3, col: 7 })).toBe(true);
    expect(isEdge({ row: 3, col: 3 })).toBe(false);
  });

  it('isXSquare がX打ちの位置を正しく判定する', () => {
    expect(isXSquare({ row: 1, col: 1 })).toBe(true);
    expect(isXSquare({ row: 1, col: 6 })).toBe(true);
    expect(isXSquare({ row: 6, col: 1 })).toBe(true);
    expect(isXSquare({ row: 6, col: 6 })).toBe(true);
    expect(isXSquare({ row: 0, col: 0 })).toBe(false);
  });

  it('isCSquare がC打ちの位置を正しく判定する', () => {
    expect(isCSquare({ row: 0, col: 1 })).toBe(true);
    expect(isCSquare({ row: 1, col: 0 })).toBe(true);
    expect(isCSquare({ row: 0, col: 6 })).toBe(true);
    expect(isCSquare({ row: 1, col: 7 })).toBe(true);
    expect(isCSquare({ row: 3, col: 3 })).toBe(false);
  });
});

describe('analyzeMove', () => {
  it('角への着手を高く評価する', () => {
    const board = createInitialBoard();
    const reasons = analyzeMove(board, { row: 0, col: 0 }, 'black');

    const cornerReason = reasons.find((r) => r.type === 'corner');
    expect(cornerReason).toBeDefined();
    expect(cornerReason?.impact).toBe('positive');
  });

  it('X打ちを警告する', () => {
    const board = createInitialBoard();
    const reasons = analyzeMove(board, { row: 1, col: 1 }, 'black');

    const xSquareReason = reasons.find((r) => r.type === 'x-square');
    expect(xSquareReason).toBeDefined();
    expect(xSquareReason?.impact).toBe('negative');
  });
});

describe('explainEvaluation', () => {
  it('評価理由を日本語で説明する', () => {
    const board = createInitialBoard();
    const explanation = explainEvaluation(board, { row: 0, col: 0 }, 'black');

    expect(explanation).toContain('角を取ることができます');
  });

  it('理由がない場合は通常の手と説明する', () => {
    const board = createInitialBoard();
    const explanation = explainEvaluation(board, { row: 3, col: 2 }, 'black');

    expect(explanation).toBe('通常の手です。');
  });
});
