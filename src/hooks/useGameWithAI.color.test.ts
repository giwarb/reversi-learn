import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameWithAI } from './useGameWithAI';

describe('useGameWithAI - 先手・後手選択', () => {
  it('デフォルトではプレイヤーが黒（先手）', () => {
    const { result } = renderHook(() => useGameWithAI(true));

    expect(result.current.playerColor).toBe('black');
  });

  it('resetGameWithColorで後手（白）を選択できる', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGameWithAI(true));

    act(() => {
      result.current.resetGameWithColor('white');
    });

    expect(result.current.playerColor).toBe('white');
    expect(result.current.isAIThinking).toBe(true);

    // AIの最初の手を待つ
    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.gameState.currentPlayer).toBe('white');

    vi.useRealTimers();
  });

  it('プレイヤーが白の場合、悪手検出が白の手に対して行われる', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    // 白を選択
    act(() => {
      result.current.resetGameWithColor('white');
    });

    // 黒の手を打つ（この場合は悪手検出されない）
    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.lastMoveAnalysis).toBeNull();

    // 白の手を打つ（この場合は悪手検出される）
    act(() => {
      result.current.makeMove({ row: 2, col: 2 });
    });

    expect(result.current.lastMoveAnalysis).not.toBeNull();
  });
});
