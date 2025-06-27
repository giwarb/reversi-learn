import { useCallback, useState } from 'react';
import type { GameState, Player, Position } from '../game/types';

export type GamePhase = 'opening' | 'middlegame' | 'endgame';

export interface GameHistoryHook {
  moveCount: number;
  totalMoves: number;
  playerMoveCount: number;
  opponentMoveCount: number;
  gamePhase: GamePhase;
  updateFromGameState: (gameState: GameState) => void;
  getLastMove: () => Position | null;
  getMoveHistory: () => Position[];
  reset: () => void;
}

export const useGameHistory = (playerColor: Player = 'black'): GameHistoryHook => {
  const [currentGameState, setCurrentGameState] = useState<GameState | null>(null);

  const updateFromGameState = useCallback((gameState: GameState) => {
    setCurrentGameState(gameState);
  }, []);

  const reset = useCallback(() => {
    setCurrentGameState(null);
  }, []);

  const getLastMove = useCallback((): Position | null => {
    if (!currentGameState || currentGameState.moveHistory.length === 0) {
      return null;
    }
    return currentGameState.moveHistory[currentGameState.moveHistory.length - 1];
  }, [currentGameState]);

  const getMoveHistory = useCallback((): Position[] => {
    if (!currentGameState) {
      return [];
    }
    return currentGameState.moveHistory;
  }, [currentGameState]);

  // Calculate derived values
  const moveCount = currentGameState?.moveHistory.length || 0;
  const totalMoves = moveCount;

  const playerMoveCount =
    currentGameState?.fullMoveHistory.filter(
      (entry) => entry.player === playerColor && entry.type === 'move'
    ).length || 0;

  const opponentMoveCount =
    currentGameState?.fullMoveHistory.filter(
      (entry) => entry.player !== playerColor && entry.type === 'move'
    ).length || 0;

  // Determine game phase based on move count
  const gamePhase: GamePhase = (() => {
    if (moveCount < 20) return 'opening';
    if (moveCount < 45) return 'middlegame';
    return 'endgame';
  })();

  return {
    moveCount,
    totalMoves,
    playerMoveCount,
    opponentMoveCount,
    gamePhase,
    updateFromGameState,
    getLastMove,
    getMoveHistory,
    reset,
  };
};
