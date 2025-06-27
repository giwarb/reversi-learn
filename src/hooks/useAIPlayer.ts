import { useCallback, useState } from 'react';
import { ReversiAI } from '../ai/ai';
import { AI_CONSTANTS } from '../constants/ai';
import type { Board, Player, Position } from '../game/types';

export interface AIPlayerHook {
  aiLevel: number;
  isAIThinking: boolean;
  useIterativeDeepening: boolean;
  aiThinkingDepth: number;
  aiTimeLimit: number;
  setAILevel: (level: number) => void;
  setUseIterativeDeepening: (enabled: boolean) => void;
  setAITimeLimit: (ms: number) => void;
  requestAIMove: (board: Board, player: Player) => Promise<Position | null>;
}

export const useAIPlayer = (): AIPlayerHook => {
  const [aiLevel, setAILevel] = useState(4);
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [useIterativeDeepening, setUseIterativeDeepening] = useState(false);
  const [aiThinkingDepth, setAIThinkingDepth] = useState(0);
  const [aiTimeLimit, setAITimeLimit] = useState(AI_CONSTANTS.DEFAULT_TIME_LIMIT_MS);
  const [ai] = useState(() => new ReversiAI({ maxDepth: aiLevel, useIterativeDeepening: false }));

  const handleSetAILevel = useCallback(
    (level: number) => {
      setAILevel(level);
      ai.setDepth(level);
    },
    [ai]
  );

  const handleSetUseIterativeDeepening = useCallback(
    (enabled: boolean) => {
      setUseIterativeDeepening(enabled);
      ai.setIterativeDeepening(enabled);
    },
    [ai]
  );

  const handleSetAITimeLimit = useCallback(
    (ms: number) => {
      setAITimeLimit(ms);
      ai.setTimeLimit(ms);
    },
    [ai]
  );

  const requestAIMove = useCallback(
    async (board: Board, player: Player): Promise<Position | null> => {
      if (isAIThinking) return null;

      setIsAIThinking(true);
      setAIThinkingDepth(0);

      return new Promise((resolve) => {
        const startThinking = Date.now();
        let progressInterval: ReturnType<typeof setInterval> | null = null;

        // Iterative Deepeningモードの場合、進捗を表示
        if (useIterativeDeepening) {
          progressInterval = setInterval(() => {
            const elapsed = Date.now() - startThinking;
            const estimatedDepth = Math.min(Math.floor(elapsed / 1000) + 1, aiLevel);
            setAIThinkingDepth(estimatedDepth);
          }, 100);
        }

        setTimeout(() => {
          if (progressInterval) {
            clearInterval(progressInterval);
          }

          const move = ai.getMove(board, player);
          setIsAIThinking(false);
          setAIThinkingDepth(0);
          resolve(move);
        }, AI_CONSTANTS.MIN_THINKING_TIME_MS);
      });
    },
    [ai, isAIThinking, useIterativeDeepening, aiLevel]
  );

  return {
    aiLevel,
    isAIThinking,
    useIterativeDeepening,
    aiThinkingDepth,
    aiTimeLimit,
    setAILevel: handleSetAILevel,
    setUseIterativeDeepening: handleSetUseIterativeDeepening,
    setAITimeLimit: handleSetAITimeLimit,
    requestAIMove,
  };
};
