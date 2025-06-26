import { type FC, useState } from 'react';
import { explainBoardEvaluation, getBriefExplanation } from '../../ai/boardEvaluationExplainer';
import type { Board, Player } from '../../game/types';
import { getAdvantageText, getNormalizedScores } from '../../utils/evaluationNormalizer';
import './EvaluationDisplay.css';

interface EvaluationDisplayProps {
  board: Board;
  evaluation: number;
  currentPlayer: Player;
  playerColor: Player;
}

export const EvaluationDisplay: FC<EvaluationDisplayProps> = ({
  board,
  evaluation,
  currentPlayer,
  playerColor,
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  // 正規化されたスコアを取得（0-100範囲、50が均衡）
  const { blackScore, whiteScore } = getNormalizedScores(evaluation);
  const playerScore = playerColor === 'black' ? blackScore : whiteScore;
  const aiScore = playerColor === 'black' ? whiteScore : blackScore;

  // スコアバーの幅を計算（0-100%）
  const blackPercentage = blackScore;

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

      <div className="player-scores large">
        <div className={`player-score ${currentPlayer === playerColor ? 'active' : ''}`}>
          <span>あなた</span>
          <span className="score-value">{playerScore.toFixed(1)}</span>
        </div>
        <div className={`player-score ${currentPlayer !== playerColor ? 'active' : ''}`}>
          <span>AI</span>
          <span className="score-value">{aiScore.toFixed(1)}</span>
        </div>
      </div>

      <div className="score-bar-container">
        <div className="score-bar">
          <div
            className="score-bar-player"
            style={{
              width: `${playerColor === 'black' ? blackPercentage : 100 - blackPercentage}%`,
            }}
          />
        </div>
        <div className="score-labels">
          <span>あなた</span>
          <span>
            {playerColor === 'black'
              ? getAdvantageText(blackScore, whiteScore)
              : getAdvantageText(whiteScore, blackScore)}
          </span>
          <span>AI</span>
        </div>
      </div>

      <div className="evaluation-explanation-section">
        <button
          type="button"
          className="toggle-explanation-button"
          onClick={() => setShowExplanation(!showExplanation)}
        >
          {showExplanation ? '▼' : '▶'} 盤面の詳細分析
        </button>

        {showExplanation && (
          <div className="evaluation-explanation">
            <h4>【盤面の分析】</h4>
            <div className="explanation-content">
              {(() => {
                const explanation = explainBoardEvaluation(board, playerColor);
                const brief = getBriefExplanation(explanation);
                return (
                  <>
                    <div className="overall-assessment">{explanation.overallAssessment}</div>
                    <pre className="explanation-details">{brief}</pre>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
