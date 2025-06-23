import { useCallback, useEffect, useState } from 'react';
import { ReversiAI } from '../ai/ai';
import type { BadMoveResult } from '../game/badMoveDetector';
import { BadMoveDetector } from '../game/badMoveDetector';
import { createInitialGameState, playMove } from '../game/gameState';
import { getAllValidMoves } from '../game/rules';
import type { GameState, Position } from '../game/types';

export interface GameWithAIState {
  gameState: GameState;
  isAIThinking: boolean;
  lastMoveAnalysis: BadMoveResult | null;
  validMoves: Position[];
  makeMove: (position: Position) => void;
  resetGame: () => void;
  setAILevel: (level: number) => void;
  aiLevel: number;
}

export const useGameWithAI = (playAgainstAI: boolean = true): GameWithAIState => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState<BadMoveResult | null>(null);
  const [aiLevel, setAILevel] = useState(4);
  const [ai] = useState(() => new ReversiAI({ maxDepth: aiLevel }));
  const [badMoveDetector] = useState(() => new BadMoveDetector(aiLevel));

  const validMoves = getAllValidMoves(gameState.board, gameState.currentPlayer);

  const makeMove = useCallback(
    async (position: Position) => {
      if (isAIThinking || gameState.gameOver) return;

      const boardBeforeMove = gameState.board;
      const newState = playMove(gameState, position);

      if (!newState) return;

      // 悪手検出（人間のプレイヤーの手のみ）
      if (gameState.currentPlayer === 'black') {
        const analysis = badMoveDetector.detectBadMove(
          boardBeforeMove,
          position,
          gameState.currentPlayer
        );
        setLastMoveAnalysis(analysis);
      }

      setGameState(newState);

      // AIの手番
      if (playAgainstAI && newState.currentPlayer === 'white' && !newState.gameOver) {
        setIsAIThinking(true);

        // AIの思考を非同期で実行
        setTimeout(() => {
          const aiMove = ai.getMove(newState.board, 'white');
          if (aiMove) {
            const aiNewState = playMove(newState, aiMove);
            if (aiNewState) {
              setGameState(aiNewState);
            }
          }
          setIsAIThinking(false);
        }, 500);
      }
    },
    [gameState, isAIThinking, playAgainstAI, ai, badMoveDetector]
  );

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setLastMoveAnalysis(null);
    setIsAIThinking(false);
  }, []);

  const handleSetAILevel = useCallback(
    (level: number) => {
      setAILevel(level);
      ai.setDepth(level);
      badMoveDetector.setAIDepth(level);
    },
    [ai, badMoveDetector]
  );

  useEffect(() => {
    // パスの処理
    if (validMoves.length === 0 && !gameState.gameOver) {
      const newState = {
        ...gameState,
        currentPlayer: gameState.currentPlayer === 'black' ? 'white' : 'black',
      } as GameState;
      setGameState(newState);
    }
  }, [gameState, validMoves.length]);

  return {
    gameState,
    isAIThinking,
    lastMoveAnalysis,
    validMoves,
    makeMove,
    resetGame,
    setAILevel: handleSetAILevel,
    aiLevel,
  };
};
