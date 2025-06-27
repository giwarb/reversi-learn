import { useCallback, useState } from 'react';
import { minimax } from '../ai/minimax';
import { EVALUATION_CONSTANTS } from '../constants/ai';
import type { BadMoveResult } from '../game/badMoveDetector';
import { BadMoveDetector } from '../game/badMoveDetector';
import type { Board, GameState, Player, Position } from '../game/types';
import { getNormalizedScores } from '../utils/evaluationNormalizer';

// Move analysis history entry
interface MoveAnalysisEntry {
  moveIndex: number; // Index in fullMoveHistory
  position: Position;
  player: Player;
  analysis: BadMoveResult;
}

export interface EvaluationHook {
  blackScore: number;
  whiteScore: number;
  rawEvaluation: number;
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
  restoreAnalysisForGameState: (gameState: GameState, playerColor: Player) => void;
}

export const useEvaluation = (initialAIDepth: number = 4): EvaluationHook => {
  const [aiDepth, setAIDepthState] = useState(initialAIDepth);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState<BadMoveResult | null>(null);
  const [beforeMoveBlackScore, setBeforeMoveBlackScore] = useState(0);
  const [beforeMoveWhiteScore, setBeforeMoveWhiteScore] = useState(0);
  const [deepBlackScore, setDeepBlackScore] = useState(50);
  const [deepWhiteScore, setDeepWhiteScore] = useState(50);
  const [rawEvaluation, setRawEvaluation] = useState(0);
  const [badMoveDetector] = useState(() => new BadMoveDetector(initialAIDepth));
  const [analysisHistory, setAnalysisHistory] = useState<MoveAnalysisEntry[]>([]);

  // 固定深度での盤面評価値を計算

  const updateEvaluation = useCallback((gameState: GameState) => {
    // ゲーム終了時は計算しない
    if (gameState.gameOver) {
      return;
    }

    // 絶対的な評価値を計算（マイナス=黒有利、プラス=白有利）
    const evaluation = minimax(
      gameState.board,
      gameState.currentPlayer,
      EVALUATION_CONSTANTS.EVALUATION_DEPTH,
      EVALUATION_CONSTANTS.MIN_SCORE,
      EVALUATION_CONSTANTS.MAX_SCORE
    );

    // 生の評価値を保存
    setRawEvaluation(evaluation);

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

      // Store analysis in history (only for player moves to avoid duplication)
      if (currentPlayer === playerColor) {
        setAnalysisHistory((prev) => {
          const newEntry: MoveAnalysisEntry = {
            moveIndex: -1, // Will be updated when we know the actual index
            position,
            player: currentPlayer,
            analysis,
          };
          return [...prev, newEntry];
        });
      }

      return analysis;
    },
    [badMoveDetector]
  );

  const clearLastMoveAnalysis = useCallback(() => {
    setLastMoveAnalysis(null);
    setAnalysisHistory([]);
  }, []);

  const restoreAnalysisForGameState = useCallback(
    (gameState: GameState, playerColor: Player) => {
      // If no moves in history, clear analysis and history
      if (gameState.fullMoveHistory.length === 0) {
        setLastMoveAnalysis(null);
        setAnalysisHistory([]);
        return;
      }

      // Clean up analysis history - only keep entries that correspond to existing moves
      const validAnalysisEntries = analysisHistory.filter((entry) =>
        gameState.fullMoveHistory.some(
          (moveEntry) =>
            moveEntry.player === entry.player &&
            moveEntry.type === 'move' &&
            moveEntry.position?.row === entry.position.row &&
            moveEntry.position?.col === entry.position.col
        )
      );

      // Update analysis history
      setAnalysisHistory(validAnalysisEntries);

      // Look for the most recent player move starting from the end
      let targetMoveIndex = gameState.fullMoveHistory.length - 1;
      while (targetMoveIndex >= 0) {
        const moveEntry = gameState.fullMoveHistory[targetMoveIndex];
        if (moveEntry.player === playerColor && moveEntry.type === 'move' && moveEntry.position) {
          // Found the last player move, try to find its analysis in the cleaned history
          const matchingAnalysis = validAnalysisEntries.find(
            (entry) =>
              entry.position.row === moveEntry.position?.row &&
              entry.position.col === moveEntry.position?.col &&
              entry.player === playerColor
          );

          if (matchingAnalysis) {
            setLastMoveAnalysis(matchingAnalysis.analysis);
          } else {
            setLastMoveAnalysis(null);
          }
          return;
        }
        targetMoveIndex--;
      }

      // No player moves found, clear analysis
      setLastMoveAnalysis(null);
    },
    [analysisHistory]
  );

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
    rawEvaluation,
    lastMoveAnalysis,
    beforeMoveBlackScore,
    beforeMoveWhiteScore,
    aiDepth,
    updateEvaluation,
    setBeforeMoveScores,
    analyzeBadMove,
    clearLastMoveAnalysis,
    setAIDepth,
    restoreAnalysisForGameState,
  };
};
