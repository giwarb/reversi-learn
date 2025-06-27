import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Board, GameState, Player } from '../game/types';
import { useEvaluation } from './useEvaluation';

vi.mock('../ai/minimax', () => ({
  minimax: vi.fn().mockReturnValue(50),
}));

vi.mock('../game/badMoveDetector', () => ({
  BadMoveDetector: vi.fn().mockImplementation(() => ({
    detectBadMove: vi.fn().mockReturnValue({
      isBadMove: true,
      reason: 'Test bad move',
      evaluation: -100,
      bestMove: { row: 1, col: 1 },
    }),
    setAIDepth: vi.fn(),
  })),
}));

describe('useEvaluation', () => {
  const mockBoard: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));
  const mockGameState: GameState = {
    board: mockBoard,
    currentPlayer: 'black' as Player,
    gameOver: false,
    winner: null,
    moveHistory: [],
    fullMoveHistory: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default evaluation state', () => {
    const { result } = renderHook(() => useEvaluation(4));

    expect(result.current.blackScore).toBe(50);
    expect(result.current.whiteScore).toBe(50);
    expect(result.current.lastMoveAnalysis).toBe(null);
    expect(result.current.beforeMoveBlackScore).toBe(0);
    expect(result.current.beforeMoveWhiteScore).toBe(0);
  });

  it('should update evaluation when game state changes', () => {
    const { result } = renderHook(() => useEvaluation(4));

    act(() => {
      result.current.updateEvaluation(mockGameState);
    });

    // getNormalizedScores(50)の期待値を確認
    // 50 -> normalizeEvaluation: ((50 + 200) / 400) * 100 = 62.5
    // blackScore: 100 - 62.5 = 37.5, whiteScore: 62.5
    expect(result.current.blackScore).toBe(37.5);
    expect(result.current.whiteScore).toBe(62.5);
  });

  it('should detect bad moves correctly', () => {
    const { result } = renderHook(() => useEvaluation(4));

    act(() => {
      const analysis = result.current.analyzeBadMove(
        mockBoard,
        { row: 0, col: 0 },
        'black',
        'black'
      );
      expect(analysis).toEqual({
        isBadMove: true,
        reason: 'Test bad move',
        evaluation: -100,
        bestMove: { row: 1, col: 1 },
      });
    });
  });

  it('should update AI depth correctly', () => {
    const { result } = renderHook(() => useEvaluation(4));

    act(() => {
      result.current.setAIDepth(6);
    });

    // The internal AI depth should be updated (verified through mock)
    expect(result.current.aiDepth).toBe(6);
  });

  it('should store before-move scores', () => {
    const { result } = renderHook(() => useEvaluation(4));

    act(() => {
      result.current.setBeforeMoveScores(25, 75);
    });

    expect(result.current.beforeMoveBlackScore).toBe(25);
    expect(result.current.beforeMoveWhiteScore).toBe(75);
  });

  it('should handle game over state', () => {
    const { result } = renderHook(() => useEvaluation(4));

    const gameOverState = {
      ...mockGameState,
      gameOver: true,
    };

    act(() => {
      result.current.updateEvaluation(gameOverState);
    });

    // Should still have valid scores even when game is over
    expect(typeof result.current.blackScore).toBe('number');
    expect(typeof result.current.whiteScore).toBe('number');
  });

  it('should clear last move analysis', () => {
    const { result } = renderHook(() => useEvaluation(4));

    // First set an analysis
    act(() => {
      result.current.analyzeBadMove(mockBoard, { row: 0, col: 0 }, 'black', 'black');
    });

    // Then clear it
    act(() => {
      result.current.clearLastMoveAnalysis();
    });

    expect(result.current.lastMoveAnalysis).toBe(null);
  });
});
