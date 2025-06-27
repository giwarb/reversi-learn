import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGameWithAI } from './useGameWithAI';

describe('useGameWithAI - 2手打ち問題のテスト', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers(); // 実際のタイマーを使用
  });

  it('プレイヤーが1手打った後、AIが1手だけ打つ', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 初期状態を確認
    expect(result.current.gameState.currentPlayer).toBe('black');
    expect(result.current.playerColor).toBe('black');
    expect(result.current.gameState.moveHistory).toHaveLength(0);

    // プレイヤー（黒）が手を打つ
    act(() => {
      result.current.makeMove({ row: 2, col: 3 }); // d3
    });

    // プレイヤーの手が即座に反映される
    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.currentPlayer).toBe('white');
    expect(result.current.gameState.board[2][3]).toBe('black');

    // AIの手を待つ
    await waitFor(
      () => {
        expect(result.current.gameState.moveHistory).toHaveLength(2);
      },
      { timeout: 3000 }
    );

    // AIが1手だけ打ったことを確認
    expect(result.current.gameState.moveHistory).toHaveLength(2);
    expect(result.current.gameState.currentPlayer).toBe('black');

    // 最後の手がAI（白）のものであることを確認
    const lastMove = result.current.gameState.fullMoveHistory[1];
    expect(lastMove.player).toBe('white');
  });

  it('プレイヤーが2手連続で打った場合の動作', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 最初の手
    act(() => {
      result.current.makeMove({ row: 2, col: 3 }); // d3
    });

    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.currentPlayer).toBe('white');

    // AIの手を待つ前に2手目を打とうとする
    act(() => {
      result.current.makeMove({ row: 2, col: 4 }); // e3 (これは無効な手のはず)
    });

    // 2手目は受け付けられないはず（currentPlayerが白なので）
    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.currentPlayer).toBe('white');

    // AIの手を待つ
    await waitFor(
      () => {
        expect(result.current.gameState.moveHistory).toHaveLength(2);
      },
      { timeout: 3000 }
    );

    // 結果として手は2手のみ（プレイヤー1手 + AI1手）
    expect(result.current.gameState.moveHistory).toHaveLength(2);
  });

  it('AIが思考中は追加の手を受け付けない', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // プレイヤーが手を打つ
    act(() => {
      result.current.makeMove({ row: 2, col: 3 }); // d3
    });

    // AI思考状態になるまで少し待つ
    await waitFor(() => {
      expect(result.current.isAIThinking).toBe(true);
    });

    // AI思考中に追加の手を打とうとする
    const moveHistoryBeforeSecondMove = result.current.gameState.moveHistory.length;

    act(() => {
      result.current.makeMove({ row: 3, col: 2 }); // c4
    });

    // 手が追加されていないことを確認
    expect(result.current.gameState.moveHistory).toHaveLength(moveHistoryBeforeSecondMove);

    // AIの手が完了するまで待つ
    await waitFor(
      () => {
        expect(result.current.isAIThinking).toBe(false);
      },
      { timeout: 3000 }
    );

    // 最終的に2手のみであることを確認
    expect(result.current.gameState.moveHistory).toHaveLength(2);
  });

  it.skip('白を選んだ場合、AIが先手を打った後プレイヤーが打てる', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 白を選択
    await act(async () => {
      await result.current.resetGameWithColor('white');
    });

    expect(result.current.playerColor).toBe('white');

    // AIが先手を打つまで待つ
    await waitFor(
      () => {
        expect(result.current.gameState.moveHistory).toHaveLength(1);
      },
      { timeout: 3000 }
    );

    expect(result.current.gameState.currentPlayer).toBe('white');
    expect(result.current.gameState.fullMoveHistory[0].player).toBe('black');

    // プレイヤー（白）が手を打つ
    act(() => {
      result.current.makeMove({ row: 2, col: 3 }); // d3
    });

    // AIがもう1手打つまで待つ（プレイヤー手追加でAIが反応）
    await waitFor(
      () => {
        expect(result.current.gameState.moveHistory).toHaveLength(3);
      },
      { timeout: 3000 }
    );

    // 合計3手（AI黒→プレイヤー白→AI黒）
    expect(result.current.gameState.moveHistory).toHaveLength(3);
    expect(result.current.gameState.fullMoveHistory[0].player).toBe('black'); // AI
    expect(result.current.gameState.fullMoveHistory[1].player).toBe('white'); // プレイヤー
    expect(result.current.gameState.fullMoveHistory[2].player).toBe('black'); // AI
  }, 10000); // タイムアウトを増やす

  it('複数回連続でmakeMoveを呼んでも1手しか反映されない', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 最初に有効な手を1つ打つ
    act(() => {
      result.current.makeMove({ row: 2, col: 3 }); // d3 - 有効な手
    });

    // 最初の手が反映される
    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.board[2][3]).toBe('black');

    // その後に複数の手を打とうとする（これらは白の手番なので拒否される）
    act(() => {
      result.current.makeMove({ row: 3, col: 2 }); // c4
      result.current.makeMove({ row: 4, col: 5 }); // f5
    });

    // 追加の手は受け付けられない
    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.board[3][2]).toBeNull();
    expect(result.current.gameState.board[4][5]).toBeNull();

    // AIの手を待つ
    await waitFor(
      () => {
        expect(result.current.gameState.moveHistory).toHaveLength(2);
      },
      { timeout: 3000 }
    );

    // 結果として2手のみ（プレイヤー1手 + AI1手）
    expect(result.current.gameState.moveHistory).toHaveLength(2);
  });
});
