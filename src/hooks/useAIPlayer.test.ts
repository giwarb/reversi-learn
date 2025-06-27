import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Board } from '../game/types';
import { useAIPlayer } from './useAIPlayer';

vi.mock('../ai/ai', () => ({
  ReversiAI: vi.fn().mockImplementation(() => ({
    getMove: vi.fn().mockReturnValue({ row: 2, col: 2 }),
    setDepth: vi.fn(),
    setIterativeDeepening: vi.fn(),
    setTimeLimit: vi.fn(),
  })),
}));

describe('useAIPlayer', () => {
  const mockBoard: Board = Array(8)
    .fill(null)
    .map(() => Array(8).fill(null));

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default AI settings', () => {
    const { result } = renderHook(() => useAIPlayer());

    expect(result.current.aiLevel).toBe(4);
    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.useIterativeDeepening).toBe(false);
    expect(result.current.aiTimeLimit).toBe(5000);
    expect(result.current.aiThinkingDepth).toBe(0);
  });

  it('should update AI level correctly', () => {
    const { result } = renderHook(() => useAIPlayer());

    act(() => {
      result.current.setAILevel(6);
    });

    expect(result.current.aiLevel).toBe(6);
  });

  it('should toggle iterative deepening', () => {
    const { result } = renderHook(() => useAIPlayer());

    expect(result.current.useIterativeDeepening).toBe(false);

    act(() => {
      result.current.setUseIterativeDeepening(true);
    });

    expect(result.current.useIterativeDeepening).toBe(true);
  });

  it('should update AI time limit', () => {
    const { result } = renderHook(() => useAIPlayer());

    act(() => {
      result.current.setAITimeLimit(10000);
    });

    expect(result.current.aiTimeLimit).toBe(10000);
  });

  it('should handle AI move request', async () => {
    const { result } = renderHook(() => useAIPlayer());

    let moveResult: { row: number; col: number } | null = null;

    await act(async () => {
      moveResult = await result.current.requestAIMove(mockBoard, 'black');
    });

    expect(moveResult).toEqual({ row: 2, col: 2 });
  });

  it('should complete AI move and reset thinking state', async () => {
    const { result } = renderHook(() => useAIPlayer());

    await act(async () => {
      const move = await result.current.requestAIMove(mockBoard, 'black');
      expect(move).toEqual({ row: 2, col: 2 });
    });

    // AI should finish thinking after the move
    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.aiThinkingDepth).toBe(0);
  });

  it('should update thinking depth during iterative deepening', async () => {
    const { result } = renderHook(() => useAIPlayer());

    act(() => {
      result.current.setUseIterativeDeepening(true);
    });

    expect(result.current.useIterativeDeepening).toBe(true);

    await act(async () => {
      await result.current.requestAIMove(mockBoard, 'black');
    });

    // Should have gone through some thinking depths and reset after completion
    expect(result.current.aiThinkingDepth).toBe(0);
  });
});
