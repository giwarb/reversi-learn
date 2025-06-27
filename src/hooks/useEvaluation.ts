import { useCallback, useState } from 'react';
import { minimax } from '../ai/minimax';
import type { BadMoveResult } from '../game/badMoveDetector';
import { BadMoveDetector } from '../game/badMoveDetector';
import type { Board, GameState, Player, Position } from '../game/types';
import { getNormalizedScores } from '../utils/evaluationNormalizer';

export interface EvaluationHook {
  blackScore: number;
  whiteScore: number;
  lastMoveAnalysis: BadMoveResult | null;
  beforeMoveBlackScore: number;
  beforeMoveWhiteScore: number;
  aiDepth: number;
  updateEvaluation: (gameState: GameState) => void;
  setBeforeMoveScores: (blackScore: number, whiteScore: number) => void;
  analyzeBadMove: (
    board: Board,
    position: Position,
    currentPlayer: Player,
    playerColor: Player
  ) => BadMoveResult | null;
  clearLastMoveAnalysis: () => void;
  setAIDepth: (depth: number) => void;
}

export const useEvaluation = (initialAIDepth: number = 4): EvaluationHook => {
  const [aiDepth, setAIDepthState] = useState(initialAIDepth);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState<BadMoveResult | null>(null);
  const [beforeMoveBlackScore, setBeforeMoveBlackScore] = useState(0);
  const [beforeMoveWhiteScore, setBeforeMoveWhiteScore] = useState(0);
  const [deepBlackScore, setDeepBlackScore] = useState(50);
  const [deepWhiteScore, setDeepWhiteScore] = useState(50);
  const [badMoveDetector] = useState(() => new BadMoveDetector(initialAIDepth));

  // 深さ4の評価値を計算（メモ化）

  const updateEvaluation = useCallback((gameState: GameState) => {
    // ゲーム終了時は計算しない
    if (gameState.gameOver) {
      return;
    }

    // 絶対的な評価値を計算（マイナス=黒有利、プラス=白有利）
    const evaluation = minimax(gameState.board, gameState.currentPlayer, 4, -1000000, 1000000);

    // 統一された正規化関数を使用
    const { blackScore, whiteScore } = getNormalizedScores(evaluation);
    setDeepBlackScore(blackScore);
    setDeepWhiteScore(whiteScore);
  }, []);

  const setBeforeMoveScores = useCallback((blackScore: number, whiteScore: number) => {
    setBeforeMoveBlackScore(blackScore);
    setBeforeMoveWhiteScore(whiteScore);
  }, []);

  const analyzeBadMove = useCallback(
    (
      board: Board,
      position: Position,
      currentPlayer: Player,
      playerColor: Player
    ): BadMoveResult | null => {
      const analysis = badMoveDetector.detectBadMove(board, position, currentPlayer, playerColor);
      setLastMoveAnalysis(analysis);
      return analysis;
    },
    [badMoveDetector]
  );

  const clearLastMoveAnalysis = useCallback(() => {
    setLastMoveAnalysis(null);
  }, []);

  const setAIDepth = useCallback(
    (depth: number) => {
      setAIDepthState(depth);
      badMoveDetector.setAIDepth(depth);
    },
    [badMoveDetector]
  );

  return {
    blackScore: deepBlackScore,
    whiteScore: deepWhiteScore,
    lastMoveAnalysis,
    beforeMoveBlackScore,
    beforeMoveWhiteScore,
    aiDepth,
    updateEvaluation,
    setBeforeMoveScores,
    analyzeBadMove,
    clearLastMoveAnalysis,
    setAIDepth,
  };
};
