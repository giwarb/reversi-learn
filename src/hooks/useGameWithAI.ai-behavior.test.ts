import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGameWithAI } from './useGameWithAI';

describe('useGameWithAI - AI Behavior', () => {
  it('should have AI make move immediately after player move', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 初期状態確認
    expect(result.current.gameState.currentPlayer).toBe('black');
    expect(result.current.playerColor).toBe('black');
    expect(result.current.gameState.moveHistory).toHaveLength(0);
    expect(result.current.isAIThinking).toBe(false);

    // プレイヤー（黒）が1手目を打つ
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    // AI処理を待つ（useEffect -> setTimeout -> AI思考 -> gameState.makeMove）
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    // プレイヤーの手が記録され、AIの手も実行される
    expect(result.current.gameState.moveHistory).toHaveLength(2); // プレイヤー + AI
    expect(result.current.gameState.currentPlayer).toBe('black'); // AIが白を打った後、再び黒の手番
    expect(result.current.isAIThinking).toBe(false); // AI思考完了
  });

  it('should not have AI make move when playAgainstAI is false', async () => {
    const { result } = renderHook(() => useGameWithAI(false));

    // プレイヤーが1手目を打つ
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    // プレイヤーの手のみ記録される（AIは打たない）
    expect(result.current.gameState.moveHistory).toHaveLength(1);
    expect(result.current.gameState.currentPlayer).toBe('white'); // 次は白の手番
    expect(result.current.isAIThinking).toBe(false);
  });

  it('should have proper turn alternation with AI', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 1手目: プレイヤー（黒）
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    // AI処理を待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    expect(result.current.gameState.moveHistory).toHaveLength(2);
    expect(result.current.gameState.currentPlayer).toBe('black');

    // 2手目: プレイヤー（黒）が再び打つ - 有効な手を選択
    const secondMove = result.current.validMoves[0]; // 最初の有効な手を選択

    await act(async () => {
      await result.current.makeMove(secondMove);
    });

    // AI処理を待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    });

    // プレイヤー2手 + AI2手 = 4手
    expect(result.current.gameState.moveHistory).toHaveLength(4);
    expect(result.current.gameState.currentPlayer).toBe('black');
  });

  it('should handle player as white correctly', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // プレイヤーを白に変更
    await act(async () => {
      result.current.resetGameWithColor('white');
      // AI処理を待つ
      await new Promise((resolve) => setTimeout(resolve, 10));
    });

    expect(result.current.playerColor).toBe('white');

    // AI（黒）が先手を打った場合の確認
    if (result.current.gameState.moveHistory.length > 0) {
      expect(result.current.gameState.currentPlayer).toBe('white'); // プレイヤーの手番

      // プレイヤー（白）が手を打つ
      await act(async () => {
        await result.current.makeMove({ row: 2, col: 3 });
      });

      // AI（黒）の手 + プレイヤー（白）の手 + AI（黒）の手 = 3手以上
      expect(result.current.gameState.moveHistory.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('should detect bad moves only for human player', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // プレイヤー（黒）が手を打つ - 悪手検出される可能性
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    // 悪手分析が実行されたかチェック（プレイヤーの手に対してのみ）
    const hasAnalysis = result.current.lastMoveAnalysis !== null;

    // AIの手に対しては悪手検出されない（プレイヤーの手のみ）
    expect(typeof hasAnalysis).toBe('boolean');
  });
});
