import { useCallback, useEffect, useState } from 'react';
import { ReversiAI } from '../ai/ai';
import type { BadMoveResult } from '../game/badMoveDetector';
import { BadMoveDetector } from '../game/badMoveDetector';
import { countPieces } from '../game/board';
import { createInitialGameState, playMove } from '../game/gameState';
import { getAllValidMoves } from '../game/rules';
import type { GameState, Player, Position } from '../game/types';

export interface GameWithAIState {
  gameState: GameState;
  isAIThinking: boolean;
  lastMoveAnalysis: BadMoveResult | null;
  validMoves: Position[];
  makeMove: (position: Position) => void;
  resetGame: () => void;
  setAILevel: (level: number) => void;
  aiLevel: number;
  undoLastMove: () => void;
  canUndo: boolean;
}

export const useGameWithAI = (playAgainstAI: boolean = true): GameWithAIState => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState<BadMoveResult | null>(null);
  const [aiLevel, setAILevel] = useState(4);
  const [ai] = useState(() => new ReversiAI({ maxDepth: aiLevel }));
  const [badMoveDetector] = useState(() => new BadMoveDetector(aiLevel));
  const [previousGameState, setPreviousGameState] = useState<GameState | null>(null);

  const validMoves = getAllValidMoves(gameState.board, gameState.currentPlayer);

  const makeMove = useCallback(
    async (position: Position) => {
      if (isAIThinking || gameState.gameOver) return;

      const boardBeforeMove = gameState.board;
      const newState = playMove(gameState, position);

      if (!newState) return;

      // 現在の状態を保存（打ち直し用）
      setPreviousGameState(gameState);

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
    setPreviousGameState(null);
  }, []);

  const undoLastMove = useCallback(() => {
    if (previousGameState && !isAIThinking) {
      setGameState(previousGameState);
      setLastMoveAnalysis(null);
      setPreviousGameState(null);
    }
  }, [previousGameState, isAIThinking]);

  const handleSetAILevel = useCallback(
    (level: number) => {
      setAILevel(level);
      ai.setDepth(level);
      badMoveDetector.setAIDepth(level);
      // ゲーム中にレベルを変更した場合は新しいゲームを開始
      if (!gameState.gameOver) {
        resetGame();
      }
    },
    [ai, badMoveDetector, gameState.gameOver, resetGame]
  );

  useEffect(() => {
    // パスの処理
    if (validMoves.length === 0 && !gameState.gameOver) {
      const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';
      const opponentMoves = getAllValidMoves(gameState.board, opponent);

      // 相手に有効な手がある場合のみ手番を切り替える
      if (opponentMoves.length > 0) {
        const newState = {
          ...gameState,
          currentPlayer: opponent,
        } as GameState;
        setGameState(newState);
      } else {
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
    undoLastMove,
    canUndo: !!previousGameState && !isAIThinking,
  };
};
