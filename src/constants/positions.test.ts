import { describe, expect, it } from 'vitest';
import { STRATEGIC_POSITIONS } from './positions';

describe('Strategic Positions Constants', () => {
  describe('CORNERS', () => {
    it('has all 4 corners defined', () => {
      expect(STRATEGIC_POSITIONS.CORNERS).toHaveLength(4);
    });

    it('has correct corner positions', () => {
      const corners = STRATEGIC_POSITIONS.CORNERS;
      expect(corners).toContainEqual({ row: 0, col: 0 });
      expect(corners).toContainEqual({ row: 0, col: 7 });
      expect(corners).toContainEqual({ row: 7, col: 0 });
      expect(corners).toContainEqual({ row: 7, col: 7 });
    });
  });

  describe('X_SQUARES', () => {
    it('has all 4 X-squares defined', () => {
      expect(STRATEGIC_POSITIONS.X_SQUARES).toHaveLength(4);
    });

    it('has correct X-square positions', () => {
      const xSquares = STRATEGIC_POSITIONS.X_SQUARES;
      expect(xSquares).toContainEqual({ row: 1, col: 1 });
      expect(xSquares).toContainEqual({ row: 1, col: 6 });
      expect(xSquares).toContainEqual({ row: 6, col: 1 });
      expect(xSquares).toContainEqual({ row: 6, col: 6 });
    });
  });

  describe('C_SQUARES', () => {
    it('has all 12 C-squares defined', () => {
      expect(STRATEGIC_POSITIONS.C_SQUARES).toHaveLength(12);
    });

    it('has correct C-square positions', () => {
      const cSquares = STRATEGIC_POSITIONS.C_SQUARES;
      // Corner edges
      expect(cSquares).toContainEqual({ row: 0, col: 1 });
      expect(cSquares).toContainEqual({ row: 1, col: 0 });
      expect(cSquares).toContainEqual({ row: 0, col: 6 });
      expect(cSquares).toContainEqual({ row: 1, col: 7 });
      expect(cSquares).toContainEqual({ row: 6, col: 0 });
      expect(cSquares).toContainEqual({ row: 7, col: 1 });
      expect(cSquares).toContainEqual({ row: 6, col: 7 });
      expect(cSquares).toContainEqual({ row: 7, col: 6 });
    });
  });

  it('positions are within valid board range', () => {
    const allPositions = [
      ...STRATEGIC_POSITIONS.CORNERS,
      ...STRATEGIC_POSITIONS.X_SQUARES,
      ...STRATEGIC_POSITIONS.C_SQUARES,
    ];

    for (const pos of allPositions) {
      expect(pos.row).toBeGreaterThanOrEqual(0);
      expect(pos.row).toBeLessThan(8);
      expect(pos.col).toBeGreaterThanOrEqual(0);
      expect(pos.col).toBeLessThan(8);
    }
  });
});
