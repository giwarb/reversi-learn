import type { FC } from 'react';
import {
  type BoardEvaluationExplanation,
  getBriefExplanation,
} from '../../ai/boardEvaluationExplainer';

interface EvaluationSummaryProps {
  blackScore: number;
  whiteScore: number;
  explanation: BoardEvaluationExplanation;
}

export const EvaluationSummary: FC<EvaluationSummaryProps> = ({
  blackScore,
  whiteScore,
  explanation,
}) => {
  return (
    <div className="board-evaluation">
      <div className="eval-score">
        黒: {blackScore.toFixed(1)} vs 白: {whiteScore.toFixed(1)}
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
