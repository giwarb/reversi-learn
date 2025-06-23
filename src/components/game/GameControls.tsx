import { type FC, useId } from 'react';

interface GameControlsProps {
  onReset: () => void;
  aiLevel: number;
  onAILevelChange: (level: number) => void;
  isGameOver: boolean;
}

export const GameControls: FC<GameControlsProps> = ({
  onReset,
  aiLevel,
  onAILevelChange,
  isGameOver,
}) => {
  const aiLevelId = useId();

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
          disabled={!isGameOver}
        >
          <option value={1}>1 (弱い)</option>
          <option value={2}>2</option>
          <option value={3}>3</option>
          <option value={4}>4 (普通)</option>
          <option value={5}>5</option>
          <option value={6}>6 (強い)</option>
        </select>
      </div>
    </div>
  );
};
