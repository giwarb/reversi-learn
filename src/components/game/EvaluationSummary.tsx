import type { FC } from 'react';
import {
  type BoardEvaluationExplanation,
  getBriefExplanation,
} from '../../ai/boardEvaluationExplainer';

interface EvaluationSummaryProps {
  playerScore: number;
  aiScore: number;
  explanation: BoardEvaluationExplanation;
}

export const EvaluationSummary: FC<EvaluationSummaryProps> = ({
  playerScore,
  aiScore,
  explanation,
}) => {
  return (
    <div className="board-evaluation">
      <div className="eval-score">
        あなた: {playerScore.toFixed(1)} vs AI: {aiScore.toFixed(1)}
      </div>
      <div className="board-analysis">
        <h4>盤面分析</h4>
        <div className="analysis-content">
          <div className="overall-assessment">{explanation.overallAssessment}</div>
          <pre className="explanation-details">{getBriefExplanation(explanation)}</pre>
        </div>
      </div>
    </div>
  );
};
