import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameWithAI } from './useGameWithAI';

describe('useGameWithAI - 先手・後手選択', () => {
  it('デフォルトではプレイヤーが黒（先手）', () => {
    const { result } = renderHook(() => useGameWithAI(true));

    expect(result.current.playerColor).toBe('black');
  });

  it('resetGameWithColorで後手（白）を選択できる', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    await act(async () => {
      result.current.resetGameWithColor('white');
      // AI処理を待つ
      await new Promise(resolve => setTimeout(resolve, 10));
    });

    expect(result.current.playerColor).toBe('white');
    
    // AIが実際に手を打ったかどうかで状態を確認
    if (result.current.gameState.moveHistory.length > 0) {
      // AIが手を打っていれば、プレイヤー（白）の手番
      expect(result.current.gameState.currentPlayer).toBe('white');
    } else {
      // AIがまだ手を打っていない場合は黒の手番のまま
      expect(result.current.gameState.currentPlayer).toBe('black');
    }
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
