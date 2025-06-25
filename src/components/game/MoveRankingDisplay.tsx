import type { FC } from 'react';
import type { BadMoveResult } from '../../game/badMoveDetector';
import './MoveRankingDisplay.css';

interface MoveRankingDisplayProps {
  lastMoveAnalysis: BadMoveResult | null;
  onShowAnalysis: () => void;
}

export const MoveRankingDisplay: FC<MoveRankingDisplayProps> = ({
  lastMoveAnalysis,
  onShowAnalysis,
}) => {
  if (!lastMoveAnalysis || !lastMoveAnalysis.rank || !lastMoveAnalysis.totalMoves) {
    return null;
  }

  const { rank, totalMoves, percentile } = lastMoveAnalysis;
  const isBestMove = rank === 1;
  const isBadMove = percentile && percentile < 20;
  
  const getRankingClass = () => {
    if (isBestMove) return 'best-move';
    if (isBadMove) return 'bad-move';
    if (percentile && percentile < 50) return 'mediocre-move';
    return 'good-move';
  };

  const getRankingText = () => {
    if (isBestMove) {
      return '最善手！';
    }
    return `${totalMoves}手中${rank}位`;
  };

  return (
    <div className="move-ranking-display">
      <div className={`ranking-info ${getRankingClass()}`}>
        <span className="ranking-label">前回の手：</span>
        <span className="ranking-value">{getRankingText()}</span>
        {percentile && !isBestMove && (
          <span className="ranking-percentile">（上位{percentile.toFixed(0)}%）</span>
        )}
      </div>
      <button
        type="button"
        className="analyze-button"
        onClick={onShowAnalysis}
        title="詳細な分析を見る"
      >
        詳細分析
      </button>
    </div>
  );
};