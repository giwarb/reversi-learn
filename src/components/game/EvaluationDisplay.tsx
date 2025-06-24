import { type FC } from 'react';
import type { Board, Player } from '../../game/types';
import './EvaluationDisplay.css';

interface EvaluationDisplayProps {
  board: Board;
  blackScore: number;
  whiteScore: number;
  currentPlayer: Player;
  playerColor: Player;
}

export const EvaluationDisplay: FC<EvaluationDisplayProps> = ({
  blackScore,
  whiteScore,
  currentPlayer,
  playerColor,
}) => {
  const scoreDifference = blackScore - whiteScore;
  const playerScore = playerColor === 'black' ? blackScore : whiteScore;
  const aiScore = playerColor === 'black' ? whiteScore : blackScore;
  
  // スコアバーの幅を計算（-100から100の範囲を0-100%に変換）
  const maxScore = 200;
  const blackPercentage = Math.max(0, Math.min(100, ((blackScore + maxScore) / (maxScore * 2)) * 100));
  
  const getAdvantageText = () => {
    const absDiff = Math.abs(scoreDifference);
    if (absDiff < 10) return '互角';
    if (absDiff < 30) return scoreDifference > 0 ? '黒やや有利' : '白やや有利';
    if (absDiff < 60) return scoreDifference > 0 ? '黒有利' : '白有利';
    return scoreDifference > 0 ? '黒優勢' : '白優勢';
  };

  return (
    <div className="evaluation-display">
      <h3>
        評価値
        <button
          type="button"
          className="help-button"
          title="評価値は盤面の有利さを数値化したものです。プラスは黒有利、マイナスは白有利を示します。"
        >
          ?
        </button>
      </h3>
      
      <div className="score-numbers">
        <div className="score-item">
          <span className="score-label">黒</span>
          <span className="score-value">{blackScore.toFixed(0)}</span>
        </div>
        <div className="score-item">
          <span className="score-label">白</span>
          <span className="score-value">{whiteScore.toFixed(0)}</span>
        </div>
        <div className="score-item">
          <span className="score-label">差</span>
          <span className="score-value">
            {scoreDifference > 0 ? '+' : ''}{scoreDifference.toFixed(0)}
          </span>
        </div>
      </div>
      
      <div className="score-bar-container">
        <div className="score-bar">
          <div
            className="score-bar-black"
            style={{ width: `${blackPercentage}%` }}
          />
        </div>
        <div className="score-labels">
          <span>黒</span>
          <span>{getAdvantageText()}</span>
          <span>白</span>
        </div>
      </div>
      
      <div className="player-scores">
        <div className={`player-score ${currentPlayer === playerColor ? 'active' : ''}`}>
          <span>あなた</span>
          <span>{playerScore.toFixed(0)}</span>
        </div>
        <div className={`player-score ${currentPlayer !== playerColor ? 'active' : ''}`}>
          <span>AI</span>
          <span>{aiScore.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );
};