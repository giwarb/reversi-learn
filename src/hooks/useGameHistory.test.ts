import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it } from 'vitest';
import type { GameState, Player } from '../game/types';
import { useGameHistory } from './useGameHistory';

describe('useGameHistory', () => {
  const mockInitialGameState: GameState = {
    board: Array(8)
      .fill(null)
      .map(() => Array(8).fill(null)),
    currentPlayer: 'black' as Player,
    gameOver: false,
    winner: null,
    moveHistory: [],
    fullMoveHistory: [],
  };

  const mockGameStateWithMoves: GameState = {
    ...mockInitialGameState,
    moveHistory: [
      { row: 2, col: 3 },
      { row: 3, col: 2 },
    ],
    fullMoveHistory: [
      {
        type: 'move',
        position: { row: 2, col: 3 },
        player: 'black',
        boardBefore: mockInitialGameState.board,
        boardAfter: mockInitialGameState.board,
      },
      {
        type: 'move',
        position: { row: 3, col: 2 },
        player: 'white',
        boardBefore: mockInitialGameState.board,
        boardAfter: mockInitialGameState.board,
      },
    ],
  };

  beforeEach(() => {
    // Reset any state if needed
  });

  it('should initialize with empty history', () => {
    const { result } = renderHook(() => useGameHistory());

    expect(result.current.moveCount).toBe(0);
    expect(result.current.totalMoves).toBe(0);
    expect(result.current.gamePhase).toBe('opening');
  });

  it('should calculate move count correctly', () => {
    const { result } = renderHook(() => useGameHistory());

    act(() => {
      result.current.updateFromGameState(mockGameStateWithMoves);
    });

    expect(result.current.moveCount).toBe(2);
    expect(result.current.totalMoves).toBe(2);
  });

  it('should determine game phase correctly', () => {
    const { result } = renderHook(() => useGameHistory());

    // Opening phase (few moves)
    act(() => {
      result.current.updateFromGameState(mockGameStateWithMoves);
    });
    expect(result.current.gamePhase).toBe('opening');

    // Create a game state with many moves for endgame
    const endgameState = {
      ...mockGameStateWithMoves,
      moveHistory: Array(50)
        .fill(null)
        .map((_, i) => ({
          row: i % 8,
          col: Math.floor(i / 8),
        })),
    };

    act(() => {
      result.current.updateFromGameState(endgameState);
    });
    expect(result.current.gamePhase).toBe('endgame');
  });

  it('should calculate player move counts', () => {
    const { result } = renderHook(() => useGameHistory());

    act(() => {
      result.current.updateFromGameState(mockGameStateWithMoves);
    });

    expect(result.current.playerMoveCount).toBe(1); // 1 black move (assuming player is black)
    expect(result.current.opponentMoveCount).toBe(1); // 1 white move
  });

  it('should handle empty game state', () => {
    const { result } = renderHook(() => useGameHistory());

    act(() => {
      result.current.updateFromGameState(mockInitialGameState);
    });

    expect(result.current.moveCount).toBe(0);
    expect(result.current.totalMoves).toBe(0);
    expect(result.current.playerMoveCount).toBe(0);
    expect(result.current.opponentMoveCount).toBe(0);
  });

  it('should get last move correctly', () => {
    const { result } = renderHook(() => useGameHistory());

    act(() => {
      result.current.updateFromGameState(mockGameStateWithMoves);
    });

    const lastMove = result.current.getLastMove();
    expect(lastMove).toEqual({ row: 3, col: 2 });
  });

  it('should return null for last move when no moves exist', () => {
    const { result } = renderHook(() => useGameHistory());

    act(() => {
      result.current.updateFromGameState(mockInitialGameState);
    });

    const lastMove = result.current.getLastMove();
    expect(lastMove).toBe(null);
  });

  it('should get move history correctly', () => {
    const { result } = renderHook(() => useGameHistory());

    act(() => {
      result.current.updateFromGameState(mockGameStateWithMoves);
    });

    const history = result.current.getMoveHistory();
    expect(history).toEqual(mockGameStateWithMoves.moveHistory);
  });

  it('should reset history', () => {
    const { result } = renderHook(() => useGameHistory());

    // First add some history
    act(() => {
      result.current.updateFromGameState(mockGameStateWithMoves);
    });

    expect(result.current.moveCount).toBe(2);

    // Then reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.moveCount).toBe(0);
    expect(result.current.gamePhase).toBe('opening');
  });
});
