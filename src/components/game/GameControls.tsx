import { type FC, useId } from 'react';

import type { Player } from '../../game/types';

interface GameControlsProps {
  onReset: () => void;
  onResetWithColor?: (color: Player) => void;
  aiLevel: number;
  onAILevelChange: (level: number) => void;
  isGameOver: boolean;
  useIterativeDeepening?: boolean;
  onIterativeDeepeningChange?: (enabled: boolean) => void;
  aiTimeLimit?: number;
  onAITimeLimitChange?: (ms: number) => void;
}

export const GameControls: FC<GameControlsProps> = ({
  onReset,
  aiLevel,
  onAILevelChange,
  isGameOver: _isGameOver,
  useIterativeDeepening = false,
  onIterativeDeepeningChange,
  aiTimeLimit = 5000,
  onAITimeLimitChange,
}) => {
  const aiLevelId = useId();
  const iterativeDeepeningId = useId();
  const timeLimitId = useId();

  return (
    <div className="controls">
      <button type="button" onClick={onReset}>
        新しいゲーム
      </button>
      <div className="ai-level-control">
        <label htmlFor={aiLevelId}>AI レベル: </label>
        <select
          id={aiLevelId}
          value={aiLevel}
          onChange={(e) => onAILevelChange(Number(e.target.value))}
        >
          <option value={1}>1 (弱い)</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4 (普通)</option>
          <option value={5}>5</option>
          <option value={6}>6 (強い)</option>
        </select>
      </div>
      {onIterativeDeepeningChange && (
        <div className="iterative-deepening-control">
          <label htmlFor={iterativeDeepeningId}>
            <input
              id={iterativeDeepeningId}
              type="checkbox"
              checked={useIterativeDeepening}
              onChange={(e) => onIterativeDeepeningChange(e.target.checked)}
            />
            Iterative Deepening
          </label>
        </div>
      )}
      {useIterativeDeepening && onAITimeLimitChange && (
        <div className="time-limit-control">
          <label htmlFor={timeLimitId}>制限時間: </label>
          <select
            id={timeLimitId}
            value={aiTimeLimit}
            onChange={(e) => onAITimeLimitChange(Number(e.target.value))}
          >
            <option value={1000}>1秒</option>
            <option value={2000}>2秒</option>
            <option value={3000}>3秒</option>
            <option value={5000}>5秒</option>
            <option value={10000}>10秒</option>
          </select>
        </div>
      )}
    </div>
  );
};
