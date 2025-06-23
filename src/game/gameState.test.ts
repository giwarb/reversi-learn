import { describe, expect, it } from 'vitest';
import { createInitialGameState, playMove } from './gameState';

describe('createInitialGameState', () => {
  it('初期ゲーム状態を作成する', () => {
    const state = createInitialGameState();

    expect(state.currentPlayer).toBe('black');
    expect(state.gameOver).toBe(false);
    expect(state.winner).toBeNull();
    expect(state.moveHistory).toHaveLength(0);
  });
});

describe('playMove', () => {
  it('有効な手を打てる', () => {
    const state = createInitialGameState();
    const newState = playMove(state, { row: 2, col: 3 });

    expect(newState).not.toBeNull();
    expect(newState?.board[2][3]).toBe('black');
    expect(newState?.currentPlayer).toBe('white');
    expect(newState?.moveHistory).toHaveLength(1);
  });

  it('無効な手はnullを返す', () => {
    const state = createInitialGameState();
    const newState = playMove(state, { row: 0, col: 0 });

    expect(newState).toBeNull();
  });

  it('既に石がある場所には打てない', () => {
    const state = createInitialGameState();
    const newState = playMove(state, { row: 3, col: 3 });

    expect(newState).toBeNull();
  });
});
