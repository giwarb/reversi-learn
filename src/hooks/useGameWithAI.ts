import { useCallback, useEffect } from 'react';
import type { BadMoveResult } from '../game/badMoveDetector';
import type { GameState, Player, Position } from '../game/types';
import { useAIPlayer } from './useAIPlayer';
import { useEvaluation } from './useEvaluation';
import { useGameHistory } from './useGameHistory';
import { useGameState } from './useGameState';

export interface GameWithAIState {
  gameState: GameState;
  isAIThinking: boolean;
  lastMoveAnalysis: BadMoveResult | null;
  validMoves: Position[];
  makeMove: (position: Position) => void;
  resetGame: () => void;
  resetGameWithColor: (playerColor: Player) => void;
  setAILevel: (level: number) => void;
  aiLevel: number;
  undoLastMove: () => void;
  canUndo: boolean;
  playerColor: Player;
  blackScore: number;
  whiteScore: number;
  isPassTurn: boolean;
  beforeMoveBlackScore: number;
  beforeMoveWhiteScore: number;
  useIterativeDeepening: boolean;
  setUseIterativeDeepening: (enabled: boolean) => void;
  aiThinkingDepth: number;
  aiTimeLimit: number;
  setAITimeLimit: (ms: number) => void;
}

export const useGameWithAI = (playAgainstAI: boolean = true): GameWithAIState => {
  // 分割されたカスタムフックを使用
  const gameState = useGameState();
  const aiPlayer = useAIPlayer();
  const evaluation = useEvaluation(aiPlayer.aiLevel);
  const gameHistory = useGameHistory(gameState.playerColor);

  // ゲーム履歴を更新
  useEffect(() => {
    gameHistory.updateFromGameState(gameState.gameState);
  }, [gameState.gameState, gameHistory]);

  // 評価値を更新
  useEffect(() => {
    evaluation.updateEvaluation(gameState.gameState);
  }, [gameState.gameState, evaluation]);

  const makeMove = useCallback(
    async (position: Position) => {
      if (aiPlayer.isAIThinking || gameState.gameState.gameOver) return;

      const boardBeforeMove = gameState.gameState.board;
      const success = gameState.makeMove(position);

      if (!success) return;

      // 悪手検出（人間のプレイヤーの手のみ）
      if (gameState.gameState.currentPlayer === gameState.playerColor) {
        // 手を打つ前の評価値を保存
        evaluation.setBeforeMoveScores(evaluation.blackScore, evaluation.whiteScore);

        evaluation.analyzeBadMove(
          boardBeforeMove,
          position,
          gameState.gameState.currentPlayer,
          gameState.playerColor
        );
      }

      // AIの手番
      const aiColor = gameState.playerColor === 'black' ? 'white' : 'black';
      if (
        playAgainstAI &&
        gameState.gameState.currentPlayer === aiColor &&
        !gameState.gameState.gameOver
      ) {
        const aiMove = await aiPlayer.requestAIMove(gameState.gameState.board, aiColor);
        if (aiMove) {
          gameState.makeMove(aiMove);
        }
      }
    },
    [gameState, aiPlayer, evaluation, playAgainstAI]
  );

  const resetGame = useCallback(() => {
    gameState.resetGame();
    evaluation.clearLastMoveAnalysis();
    gameHistory.reset();
  }, [gameState, evaluation, gameHistory]);

  const resetGameWithColor = useCallback(
    (newPlayerColor: Player) => {
      gameState.resetGameWithColor(newPlayerColor);
      evaluation.clearLastMoveAnalysis();
      gameHistory.reset();

      // 後手（白）を選んだ場合、AIに最初の一手を打たせる（非同期実行）
      if (playAgainstAI && newPlayerColor === 'white') {
        setTimeout(async () => {
          const aiMove = await aiPlayer.requestAIMove(gameState.gameState.board, 'black');
          if (aiMove) {
            gameState.makeMove(aiMove);
          }
        }, 0);
      }
    },
    [playAgainstAI, gameState, evaluation, gameHistory, aiPlayer]
  );

  const undoLastMove = useCallback(async () => {
    if (aiPlayer.isAIThinking) return;

    gameState.undoLastMove();
    evaluation.clearLastMoveAnalysis();

    // プレイヤーが白で、最初の状態に戻った場合、AIに最初の手を打たせる
    if (gameState.playerColor === 'white' && gameState.gameState.moveHistory.length === 0) {
      const aiMove = await aiPlayer.requestAIMove(gameState.gameState.board, 'black');
      if (aiMove) {
        gameState.makeMove(aiMove);
      }
    }
  }, [gameState, aiPlayer, evaluation]);

  const handleSetAILevel = useCallback(
    (level: number) => {
      aiPlayer.setAILevel(level);
      evaluation.setAIDepth(level);
    },
    [aiPlayer, evaluation]
  );

  const handleSetUseIterativeDeepening = useCallback(
    (enabled: boolean) => {
      aiPlayer.setUseIterativeDeepening(enabled);
    },
    [aiPlayer]
  );

  const handleSetAITimeLimit = useCallback(
    (ms: number) => {
      aiPlayer.setAITimeLimit(ms);
    },
    [aiPlayer]
  );

  // パスの処理
  useEffect(() => {
    if (
      gameState.validMoves.length === 0 &&
      !gameState.gameState.gameOver &&
      !aiPlayer.isAIThinking
    ) {
      const opponent = gameState.gameState.currentPlayer === 'black' ? 'white' : 'black';
      // パス処理または ゲーム終了チェック
      gameState.handlePass();
      gameState.checkGameEnd();

      // パスの後、AIの手番になった場合
      const aiColor = gameState.playerColor === 'black' ? 'white' : 'black';
      if (playAgainstAI && opponent === aiColor) {
        setTimeout(async () => {
          const aiMove = await aiPlayer.requestAIMove(gameState.gameState.board, aiColor);
          if (aiMove) {
            gameState.makeMove(aiMove);
          }
        }, 1500);
      }
    }
  }, [gameState, aiPlayer, playAgainstAI]);

  return {
    gameState: gameState.gameState,
    isAIThinking: aiPlayer.isAIThinking,
    lastMoveAnalysis: evaluation.lastMoveAnalysis,
    validMoves: gameState.validMoves,
    makeMove,
    resetGame,
    resetGameWithColor,
    setAILevel: handleSetAILevel,
    aiLevel: aiPlayer.aiLevel,
    undoLastMove,
    canUndo: gameState.canUndo && !aiPlayer.isAIThinking,
    playerColor: gameState.playerColor,
    blackScore: evaluation.blackScore,
    whiteScore: evaluation.whiteScore,
    isPassTurn: gameState.isPassTurn,
    beforeMoveBlackScore: evaluation.beforeMoveBlackScore,
    beforeMoveWhiteScore: evaluation.beforeMoveWhiteScore,
    useIterativeDeepening: aiPlayer.useIterativeDeepening,
    setUseIterativeDeepening: handleSetUseIterativeDeepening,
    aiThinkingDepth: aiPlayer.aiThinkingDepth,
    aiTimeLimit: aiPlayer.aiTimeLimit,
    setAITimeLimit: handleSetAITimeLimit,
  };
};
