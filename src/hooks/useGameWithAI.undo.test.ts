import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { useGameWithAI } from './useGameWithAI';

describe('useGameWithAI - 一手戻る (Undo)', () => {
  it('should have AI make move after undo', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 初期状態確認
    expect(result.current.gameState.currentPlayer).toBe('black');
    expect(result.current.gameState.moveHistory).toHaveLength(0);

    // プレイヤー（黒）が1手目を打つ
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    // AI処理を待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // プレイヤー1手 + AI1手 = 2手
    expect(result.current.gameState.moveHistory).toHaveLength(2);
    expect(result.current.gameState.currentPlayer).toBe('black');

    // 一手戻る（プレイヤーの最後の手まで戻る）
    await act(async () => {
      result.current.undoLastMove();
    });

    // 初期状態に戻っているはず
    expect(result.current.gameState.moveHistory).toHaveLength(0);
    expect(result.current.gameState.currentPlayer).toBe('black');

    // もう一度プレイヤーが手を打つ
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    // AI処理を待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // プレイヤー1手 + AI1手 = 2手（AIが正しく動作する）
    expect(result.current.gameState.moveHistory).toHaveLength(2);
    expect(result.current.gameState.currentPlayer).toBe('black');
  });

  it('should have AI make move after multiple undos', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // 複数の手を打つ
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    const validMove = result.current.validMoves[0];
    await act(async () => {
      await result.current.makeMove(validMove);
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.gameState.moveHistory.length).toBeGreaterThanOrEqual(3);

    // 一手戻る
    await act(async () => {
      result.current.undoLastMove();
    });

    const currentMoveCount = result.current.gameState.moveHistory.length;

    // もう一度手を打つ
    const nextValidMove = result.current.validMoves[0];
    await act(async () => {
      await result.current.makeMove(nextValidMove);
    });

    // AI処理を待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // AIが手を打ったことを確認
    expect(result.current.gameState.moveHistory.length).toBeGreaterThan(currentMoveCount);
  });

  it('should reset AI state properly after undo to initial position', async () => {
    const { result } = renderHook(() => useGameWithAI(true));

    // プレイヤーが手を打つ
    await act(async () => {
      await result.current.makeMove({ row: 2, col: 3 });
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    expect(result.current.gameState.moveHistory).toHaveLength(2);

    // 初期状態まで戻る
    await act(async () => {
      result.current.undoLastMove();
    });

    expect(result.current.gameState.moveHistory).toHaveLength(0);
    expect(result.current.gameState.currentPlayer).toBe('black');

    // 別の位置に打つ
    await act(async () => {
      await result.current.makeMove({ row: 3, col: 2 });
    });

    // AI処理を待つ
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    });

    // AIが手を打ったことを確認
    expect(result.current.gameState.moveHistory).toHaveLength(2);
    expect(result.current.gameState.currentPlayer).toBe('black');
  });
});
