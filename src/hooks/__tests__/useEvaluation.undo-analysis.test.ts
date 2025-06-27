import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../../game/board';
import { createInitialGameState } from '../../game/gameState';
import type { Position } from '../../game/types';
import { useEvaluation } from '../useEvaluation';

describe('useEvaluation - Move Analysis Persistence', () => {
  it('should restore analysis for the current game state', () => {
    const { result } = renderHook(() => useEvaluation(4));

    // Create a mock game state with some moves
    const initialBoard = createInitialBoard();
    const gameState = {
      ...createInitialGameState(),
      fullMoveHistory: [
        {
          type: 'move' as const,
          position: { row: 2, col: 3 } as Position, // d3
          player: 'black' as const,
          boardBefore: initialBoard,
          boardAfter: initialBoard,
        },
        {
          type: 'move' as const,
          position: { row: 2, col: 4 } as Position, // e3
          player: 'white' as const,
          boardBefore: initialBoard,
          boardAfter: initialBoard,
        },
      ],
    };

    // Simulate making moves and analyzing them
    act(() => {
      const firstAnalysis = result.current.analyzeBadMove(
        initialBoard,
        { row: 2, col: 3 },
        'black',
        'black'
      );
      expect(firstAnalysis).toBeTruthy();
    });

    // Store first analysis for later verification if needed

    act(() => {
      const secondAnalysis = result.current.analyzeBadMove(
        initialBoard,
        { row: 2, col: 4 },
        'white',
        'black' // Player is still black
      );
      expect(secondAnalysis).toBeTruthy();
    });

    // Should now show the latest analysis (which wasn't the player's move, so no history saved)
    expect(result.current.lastMoveAnalysis).toBeTruthy();

    // Simulate undoing back to first move state
    const gameStateAfterUndo = {
      ...gameState,
      fullMoveHistory: [gameState.fullMoveHistory[0]], // Only first move remains
    };

    act(() => {
      result.current.restoreAnalysisForGameState(gameStateAfterUndo, 'black');
    });

    // Should restore the analysis for the first move
    expect(result.current.lastMoveAnalysis).toBeTruthy();
    expect(result.current.lastMoveAnalysis?.playerMove).toEqual({ row: 2, col: 3 });
  });

  it('should clear analysis when no moves remain', () => {
    const { result } = renderHook(() => useEvaluation(4));

    // Make a move first
    act(() => {
      result.current.analyzeBadMove(createInitialBoard(), { row: 2, col: 3 }, 'black', 'black');
    });

    expect(result.current.lastMoveAnalysis).toBeTruthy();

    // Simulate empty game state (all moves undone)
    const emptyGameState = createInitialGameState();

    act(() => {
      result.current.restoreAnalysisForGameState(emptyGameState, 'black');
    });

    // Should clear analysis
    expect(result.current.lastMoveAnalysis).toBeNull();
  });
});
