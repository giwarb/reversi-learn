import type { FC } from 'react';
import type { Board, Player } from '../../game/types';
import { getAdvantageText, getNormalizedScores } from '../../utils/evaluationNormalizer';
import './EvaluationDisplay.css';

interface EvaluationDisplayProps {
  board: Board;
  blackScore: number;
  whiteScore: number;
  currentPlayer: Player;
  playerColor: Player;
}

export const EvaluationDisplay: FC<EvaluationDisplayProps> = ({
  blackScore: blackRawScore,
  whiteScore: whiteRawScore,
  currentPlayer,
  playerColor,
}) => {
  // 正規化されたスコアを取得（0-100範囲、50が均衡）
  const { blackScore, whiteScore } = getNormalizedScores(blackRawScore, whiteRawScore);
  const playerScore = playerColor === 'black' ? blackScore : whiteScore;
  const aiScore = playerColor === 'black' ? whiteScore : blackScore;

  // スコアバーの幅を計算（0-100%）
  const blackPercentage = blackScore;

  const advantageText = getAdvantageText(blackScore, whiteScore);

  return (
    <div className="evaluation-display">
      <h3>
        評価値
        <button
          type="button"
          className="help-button"
          title="評価値は盤面の有利さを数値化したものです。50が均衡状態で、100に近いほど有利、0に近いほど不利を示します。"
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
          <span className="score-value">{Math.abs(blackScore - whiteScore).toFixed(0)}</span>
        </div>
      </div>

      <div className="score-bar-container">
        <div className="score-bar">
          <div className="score-bar-black" style={{ width: `${blackPercentage}%` }} />
        </div>
        <div className="score-labels">
          <span>黒</span>
          <span>{advantageText}</span>
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
