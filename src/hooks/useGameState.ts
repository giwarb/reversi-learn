import { useCallback, useState } from 'react';
import { clearCachesOnGameStart } from '../ai/cache/cacheManager';
import { countPieces } from '../game/board';
import { createInitialGameState, playMove, playPass } from '../game/gameState';
import { getAllValidMoves } from '../game/rules';
import type { GameState, Player, Position } from '../game/types';

export interface GameStateHook {
  gameState: GameState;
  validMoves: Position[];
  playerColor: Player;
  isPassTurn: boolean;
  canUndo: boolean;
  makeMove: (position: Position) => boolean;
  resetGame: () => void;
  resetGameWithColor: (playerColor: Player) => void;
  undoLastMove: () => void;
  handlePass: () => void;
  checkGameEnd: () => void;
}

export const useGameState = (): GameStateHook => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [playerColor, setPlayerColor] = useState<Player>('black');
  const [isPassTurn, setIsPassTurn] = useState(false);

  const validMoves = getAllValidMoves(gameState.board, gameState.currentPlayer);

  const makeMove = useCallback(
    (position: Position): boolean => {
      if (gameState.gameOver) return false;

      const newState = playMove(gameState, position);
      if (!newState) return false;

      setGameState(newState);
      setIsPassTurn(false);
      return true;
    },
    [gameState]
  );

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setIsPassTurn(false);
    clearCachesOnGameStart();
  }, []);

  const resetGameWithColor = useCallback((newPlayerColor: Player) => {
    setPlayerColor(newPlayerColor);
    setGameState(createInitialGameState());
    setIsPassTurn(false);
    clearCachesOnGameStart();
  }, []);

  const undoLastMove = useCallback(() => {
    if (!gameState.fullMoveHistory.length) return;

    // プレイヤーの最後の手まで戻る
    let targetIndex = gameState.fullMoveHistory.length - 1;

    // プレイヤーの手を見つける
    while (targetIndex >= 0 && gameState.fullMoveHistory[targetIndex].player !== playerColor) {
      targetIndex--;
    }

    if (targetIndex < 0) return;

    // プレイヤーの手の前の状態に戻る
    targetIndex--;

    if (targetIndex < 0) {
      // 最初の状態に戻る
      setGameState(createInitialGameState());
    } else {
      // 指定されたインデックスの状態に戻る
      const targetEntry = gameState.fullMoveHistory[targetIndex];
      const newState = {
        ...gameState,
        board: targetEntry.boardAfter,
        currentPlayer: (targetEntry.player === 'black' ? 'white' : 'black') as Player,
        gameOver: false,
        winner: null,
        moveHistory: gameState.moveHistory.slice(
          0,
          gameState.fullMoveHistory
            .slice(0, targetIndex + 1)
            .filter((entry) => entry.type === 'move').length
        ),
        fullMoveHistory: gameState.fullMoveHistory.slice(0, targetIndex + 1),
      };
      setGameState(newState);
    }
    setIsPassTurn(false);
  }, [gameState, playerColor]);

  const handlePass = useCallback(() => {
    setIsPassTurn(true);
    setTimeout(() => {
      const newState = playPass(gameState, gameState.currentPlayer);
      setGameState(newState);
      setIsPassTurn(false);
    }, 1500);
  }, [gameState]);

  const checkGameEnd = useCallback(() => {
    const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';
    const opponentMoves = getAllValidMoves(gameState.board, opponent);

    if (validMoves.length === 0 && opponentMoves.length === 0) {
      // 両方とも打てない場合はゲーム終了
      const counts = countPieces(gameState.board);
      let winner: Player | 'draw' | null;

      if (counts.black > counts.white) {
        winner = 'black';
      } else if (counts.white > counts.black) {
        winner = 'white';
      } else {
        winner = 'draw';
      }

      setGameState({
        ...gameState,
        gameOver: true,
        winner,
      });
    }
  }, [gameState, validMoves.length]);

  const canUndo = gameState.fullMoveHistory.some((entry) => entry.player === playerColor);

  return {
    gameState,
    validMoves,
    playerColor,
    isPassTurn,
    canUndo,
    makeMove,
    resetGame,
    resetGameWithColor,
    undoLastMove,
    handlePass,
    checkGameEnd,
  };
};
