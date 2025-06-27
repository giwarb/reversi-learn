import { describe, expect, it } from 'vitest';
import { getColumnLabel, getRowLabel, positionToAlgebraic } from './boardUtils';

describe('boardUtils', () => {
  describe('getColumnLabel', () => {
    it('returns correct column labels', () => {
      expect(getColumnLabel(0)).toBe('a');
      expect(getColumnLabel(3)).toBe('d');
      expect(getColumnLabel(7)).toBe('h');
    });
  });

  describe('getRowLabel', () => {
    it('returns correct row labels', () => {
      expect(getRowLabel(0)).toBe('1');
      expect(getRowLabel(3)).toBe('4');
      expect(getRowLabel(7)).toBe('8');
    });
  });

  describe('positionToAlgebraic', () => {
    it('converts position to algebraic notation', () => {
      expect(positionToAlgebraic({ row: 0, col: 0 })).toBe('a1');
      expect(positionToAlgebraic({ row: 3, col: 3 })).toBe('d4');
      expect(positionToAlgebraic({ row: 7, col: 7 })).toBe('h8');
    });
  });
});
