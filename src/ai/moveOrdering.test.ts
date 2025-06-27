import { describe, expect, it } from 'vitest';
import type { Position } from '../game/types';

// テスト用の関数をインポート（実装後に利用）
import { compareMovesByPriority, getMovePositionPriority, isCorner, isEdge } from './moveOrdering';

describe('Move Ordering Utility Functions', () => {
  describe('isCorner', () => {
    it('should identify corner positions correctly', () => {
      expect(isCorner({ row: 0, col: 0 })).toBe(true);
      expect(isCorner({ row: 0, col: 7 })).toBe(true);
      expect(isCorner({ row: 7, col: 0 })).toBe(true);
      expect(isCorner({ row: 7, col: 7 })).toBe(true);
    });

    it('should return false for non-corner positions', () => {
      expect(isCorner({ row: 0, col: 1 })).toBe(false);
      expect(isCorner({ row: 1, col: 0 })).toBe(false);
      expect(isCorner({ row: 3, col: 3 })).toBe(false);
      expect(isCorner({ row: 7, col: 6 })).toBe(false);
    });
  });

  describe('isEdge', () => {
    it('should identify edge positions correctly', () => {
      expect(isEdge({ row: 0, col: 3 })).toBe(true);
      expect(isEdge({ row: 7, col: 4 })).toBe(true);
      expect(isEdge({ row: 3, col: 0 })).toBe(true);
      expect(isEdge({ row: 4, col: 7 })).toBe(true);
    });

    it('should return true for corners (corners are also edges)', () => {
      expect(isEdge({ row: 0, col: 0 })).toBe(true);
      expect(isEdge({ row: 7, col: 7 })).toBe(true);
    });

    it('should return false for center positions', () => {
      expect(isEdge({ row: 3, col: 3 })).toBe(false);
      expect(isEdge({ row: 4, col: 4 })).toBe(false);
      expect(isEdge({ row: 2, col: 5 })).toBe(false);
    });
  });

  describe('getMovePositionPriority', () => {
    it('should return highest priority for corners', () => {
      expect(getMovePositionPriority({ row: 0, col: 0 })).toBe(2);
      expect(getMovePositionPriority({ row: 7, col: 7 })).toBe(2);
    });

    it('should return medium priority for edges', () => {
      expect(getMovePositionPriority({ row: 0, col: 3 })).toBe(1);
      expect(getMovePositionPriority({ row: 3, col: 7 })).toBe(1);
    });

    it('should return lowest priority for center positions', () => {
      expect(getMovePositionPriority({ row: 3, col: 3 })).toBe(0);
      expect(getMovePositionPriority({ row: 4, col: 4 })).toBe(0);
    });
  });

  describe('compareMovesByPriority', () => {
    it('should prioritize corners over edges', () => {
      const corner: Position = { row: 0, col: 0 };
      const edge: Position = { row: 0, col: 3 };
      expect(compareMovesByPriority(corner, edge)).toBe(-1);
      expect(compareMovesByPriority(edge, corner)).toBe(1);
    });

    it('should prioritize edges over center', () => {
      const edge: Position = { row: 0, col: 3 };
      const center: Position = { row: 3, col: 3 };
      expect(compareMovesByPriority(edge, center)).toBe(-1);
      expect(compareMovesByPriority(center, edge)).toBe(1);
    });

    it('should return 0 for positions with same priority', () => {
      const corner1: Position = { row: 0, col: 0 };
      const corner2: Position = { row: 7, col: 7 };
      const edge1: Position = { row: 0, col: 3 };
      const edge2: Position = { row: 3, col: 7 };
      const center1: Position = { row: 3, col: 3 };
      const center2: Position = { row: 4, col: 4 };

      expect(compareMovesByPriority(corner1, corner2)).toBe(0);
      expect(compareMovesByPriority(edge1, edge2)).toBe(0);
      expect(compareMovesByPriority(center1, center2)).toBe(0);
    });

    it('should handle previous best move priority correctly', () => {
      const previousBest: Position = { row: 3, col: 3 };
      const corner: Position = { row: 0, col: 0 };

      // Previous best should have highest priority
      expect(compareMovesByPriority(previousBest, corner, previousBest)).toBe(-1);
      expect(compareMovesByPriority(corner, previousBest, previousBest)).toBe(1);
    });

    it('should fall back to position priority when no previous best', () => {
      const corner: Position = { row: 0, col: 0 };
      const edge: Position = { row: 0, col: 3 };

      expect(compareMovesByPriority(corner, edge)).toBe(-1);
      expect(compareMovesByPriority(edge, corner)).toBe(1);
    });
  });

  describe('Integration with arrays', () => {
    it('should sort moves correctly by priority', () => {
      const moves: Position[] = [
        { row: 3, col: 3 }, // center
        { row: 0, col: 0 }, // corner
        { row: 0, col: 3 }, // edge
        { row: 7, col: 7 }, // corner
        { row: 4, col: 4 }, // center
        { row: 3, col: 7 }, // edge
      ];

      const sorted = moves.sort(compareMovesByPriority);

      // Should be: corners first, then edges, then centers
      expect(getMovePositionPriority(sorted[0])).toBe(2); // corner
      expect(getMovePositionPriority(sorted[1])).toBe(2); // corner
      expect(getMovePositionPriority(sorted[2])).toBe(1); // edge
      expect(getMovePositionPriority(sorted[3])).toBe(1); // edge
      expect(getMovePositionPriority(sorted[4])).toBe(0); // center
      expect(getMovePositionPriority(sorted[5])).toBe(0); // center
    });

    it('should prioritize previous best move', () => {
      const moves: Position[] = [
        { row: 0, col: 0 }, // corner
        { row: 3, col: 3 }, // center (previous best)
        { row: 0, col: 3 }, // edge
      ];
      const previousBest: Position = { row: 3, col: 3 };

      const sorted = moves.sort((a, b) => compareMovesByPriority(a, b, previousBest));

      // Previous best should be first
      expect(sorted[0]).toEqual(previousBest);
    });
  });
});
