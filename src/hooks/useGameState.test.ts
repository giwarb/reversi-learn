import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameState } from './useGameState';

vi.mock('../ai/cache/cacheManager', () => ({
  clearCachesOnGameStart: vi.fn(),
}));

vi.mock('../ai/cache/validMovesCache', () => ({
  globalValidMovesCache: {
    get: vi.fn(() => null),
    set: vi.fn(),
  },
}));

describe('useGameState', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default game state', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.gameState.currentPlayer).toBe('black');
    expect(result.current.gameState.gameOver).toBe(false);
    expect(result.current.gameState.moveHistory).toEqual([]);
    expect(result.current.gameState.fullMoveHistory).toEqual([]);
  });

  it('should make a move successfully', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.gameState.currentPlayer).toBe('white');
    expect(result.current.gameState.moveHistory).toHaveLength(1);
  });

  it('should reset game state', () => {
    const { result } = renderHook(() => useGameState());

    // Make a move first
    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    // Then reset
    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.currentPlayer).toBe('black');
    expect(result.current.gameState.moveHistory).toEqual([]);
    expect(result.current.gameState.fullMoveHistory).toEqual([]);
  });

  it('should handle player color change', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.playerColor).toBe('black');

    act(() => {
      result.current.resetGameWithColor('white');
    });

    expect(result.current.playerColor).toBe('white');
  });

  it('should handle undo functionality', () => {
    const { result } = renderHook(() => useGameState());

    // Make a move
    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.canUndo).toBe(true);

    // Undo the move
    act(() => {
      result.current.undoLastMove();
    });

    expect(result.current.gameState.moveHistory).toHaveLength(0);
    expect(result.current.gameState.currentPlayer).toBe('black');
  });

  it('should prevent undo when no moves available', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.canUndo).toBe(false);

    act(() => {
      result.current.undoLastMove();
    });

    expect(result.current.gameState.moveHistory).toEqual([]);
  });

  it('should calculate valid moves correctly', () => {
    const { result } = renderHook(() => useGameState());

    expect(result.current.validMoves).toHaveLength(4);
    expect(result.current.validMoves.map((m) => ({ row: m.row, col: m.col }))).toContainEqual({
      row: 2,
      col: 3,
    });
    expect(result.current.validMoves.map((m) => ({ row: m.row, col: m.col }))).toContainEqual({
      row: 3,
      col: 2,
    });
    expect(result.current.validMoves.map((m) => ({ row: m.row, col: m.col }))).toContainEqual({
      row: 4,
      col: 5,
    });
    expect(result.current.validMoves.map((m) => ({ row: m.row, col: m.col }))).toContainEqual({
      row: 5,
      col: 4,
    });
  });

  it('should handle pass turn correctly', () => {
    const { result } = renderHook(() => useGameState());

    act(() => {
      result.current.handlePass();
    });

    expect(result.current.isPassTurn).toBe(true);
  });
});
