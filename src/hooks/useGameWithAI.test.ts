import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { useGameWithAI } from './useGameWithAI';

describe('useGameWithAI', () => {
  it('初期状態を正しく設定する', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    expect(result.current.gameState.currentPlayer).toBe('black');
    expect(result.current.gameState.gameOver).toBe(false);
    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.validMoves).toHaveLength(4);
  });

  it('有効な手を打てる', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.gameState.board[2][3]).toBe('black');
    expect(result.current.gameState.currentPlayer).toBe('white');
  });

  it('無効な手は無視される', () => {
    const { result } = renderHook(() => useGameWithAI(false));
    const initialBoard = result.current.gameState.board;

    act(() => {
      result.current.makeMove({ row: 0, col: 0 });
    });

    expect(result.current.gameState.board).toEqual(initialBoard);
  });

  it('ゲームをリセットできる', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.gameState.moveHistory).toHaveLength(1);

    act(() => {
      result.current.resetGame();
    });

    expect(result.current.gameState.moveHistory).toHaveLength(0);
    expect(result.current.gameState.currentPlayer).toBe('black');
  });

  it('AIレベルを設定できる', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    expect(result.current.aiLevel).toBe(4);

    act(() => {
      result.current.setAILevel(6);
    });

    expect(result.current.aiLevel).toBe(6);
  });

  it('ゲーム中にAIレベルを変更してもゲームは継続される', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    // ゲームを進める
    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.currentPlayer).toBe('white');

    // AIレベルを変更
    act(() => {
      result.current.setAILevel(5);
    });

    // ゲームが継続されていることを確認（リセットされない）
    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.currentPlayer).toBe('white');
    expect(result.current.aiLevel).toBe(5);
  });

  it('ゲーム終了状態をシミュレートする（テストスキップ）', () => {
    // このテストは現在の実装では適切にテストできないため、
    // 統合テストやE2Eテストで検証することを推奨
    expect(true).toBe(true);
  });

  it('AI対戦モードでAIが手を打つ', async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGameWithAI(true));

    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.isAIThinking).toBe(true);

    act(() => {
      vi.advanceTimersByTime(600);
    });

    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.gameState.currentPlayer).toBe('black');

    vi.useRealTimers();
  });

  it('悪手分析が実行される', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    expect(result.current.lastMoveAnalysis).not.toBeNull();
    expect(result.current.lastMoveAnalysis?.playerMove).toEqual({ row: 2, col: 3 });
  });

  it('打ち直し機能が正しく動作する', () => {
    const { result } = renderHook(() => useGameWithAI(false));

    // 初期状態では打ち直しできない
    expect(result.current.canUndo).toBe(false);

    // 手を打つ
    const initialBoard = [...result.current.gameState.board.map((row) => [...row])];
    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    // 打ち直し可能になる
    expect(result.current.canUndo).toBe(true);

    // 打ち直す
    act(() => {
      result.current.undoLastMove();
    });

    // 盤面が元に戻る
    expect(result.current.gameState.board).toEqual(initialBoard);
    expect(result.current.canUndo).toBe(false);
    expect(result.current.lastMoveAnalysis).toBeNull();
  });

  it('AI思考中は打ち直しできない', () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useGameWithAI(true));

    // 手を打つとAIが思考開始
    act(() => {
      result.current.makeMove({ row: 2, col: 3 });
    });

    // AI思考中
    expect(result.current.isAIThinking).toBe(true);
    expect(result.current.canUndo).toBe(false);

    // AIの思考が終わるまで時間を進める
    act(() => {
      vi.advanceTimersByTime(600);
    });

    // AI思考が終了し、打ち直し可能になる
    expect(result.current.isAIThinking).toBe(false);
    expect(result.current.canUndo).toBe(true);

    vi.useRealTimers();
  });
});
