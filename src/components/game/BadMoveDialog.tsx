import { type FC, useEffect, useMemo } from 'react';
import { explainBoardEvaluation } from '../../ai/boardEvaluationExplainer';
import { minimax } from '../../ai/minimax';
import type { BadMoveResult } from '../../game/badMoveDetector';
import { getValidMove, makeMove } from '../../game/rules';
import type { Board, Player, Position } from '../../game/types';
import { getNormalizedScores } from '../../utils/evaluationNormalizer';
import { BoardDisplay } from './BoardDisplay';
import { EvaluationSummary } from './EvaluationSummary';
import { MoveList } from './MoveList';
import './BadMoveDialog.css';

interface BadMoveDialogProps {
  analysis: BadMoveResult | null;
  initialBoard: Board; // プレイヤーが打つ前の盤面A
  playerMove: Position; // プレイヤーの手p1
  playerColor: Player;
  depth: number;
  onClose: () => void;
  onUndo?: () => void;
}

export const BadMoveDialog: FC<BadMoveDialogProps> = ({
  analysis,
  initialBoard,
  playerMove,
  playerColor,
  depth,
  onClose,
  onUndo,
}) => {
  const boardBeforeMove = initialBoard;

  const boardAfterPlayerMove = useMemo(() => {
    const validMove = getValidMove(boardBeforeMove, playerMove, playerColor);
    if (!validMove) return boardBeforeMove;
    return makeMove(boardBeforeMove, validMove, playerColor);
  }, [boardBeforeMove, playerMove, playerColor]);

  const aiRecommendedMove = analysis?.aiRecommendation || null;

  const boardAfterAIRecommendation = useMemo(() => {
    if (!aiRecommendedMove) return boardBeforeMove;
    const validMove = getValidMove(boardBeforeMove, aiRecommendedMove, playerColor);
    if (!validMove) return boardBeforeMove;
    return makeMove(boardBeforeMove, validMove, playerColor);
  }, [boardBeforeMove, aiRecommendedMove, playerColor]);

  const playerMoveEvaluation = useMemo(() => {
    const currentPlayer = playerColor === 'black' ? 'white' : 'black';
    return minimax(boardAfterPlayerMove, currentPlayer, depth, -1000000, 1000000);
  }, [boardAfterPlayerMove, playerColor, depth]);

  const aiRecommendationEvaluation = useMemo(() => {
    const currentPlayer = playerColor === 'black' ? 'white' : 'black';
    return minimax(boardAfterAIRecommendation, currentPlayer, depth, -1000000, 1000000);
  }, [boardAfterAIRecommendation, playerColor, depth]);

  const playerMoveExplanation = useMemo(
    () => explainBoardEvaluation(boardAfterPlayerMove, playerColor),
    [boardAfterPlayerMove, playerColor]
  );
  const aiMoveExplanation = useMemo(
    () => explainBoardEvaluation(boardAfterAIRecommendation, playerColor),
    [boardAfterAIRecommendation, playerColor]
  );

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!analysis) return null;

  const getDialogClass = () => {
    if (analysis.explanation.includes('最善手を選びました')) {
      return 'success';
    }
    if (analysis.isBadMove) {
      return 'error';
    }
    return 'warning';
  };

  const getTitle = () => {
    if (analysis.rank && analysis.totalMoves) {
      return `手の分析：${analysis.totalMoves}手中${analysis.rank}位`;
    }
    return '手の分析';
  };

  return (
    <>
      <div
        className="dialog-overlay"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />
      <div className={`bad-move-dialog ${getDialogClass()}`}>
        <div className="dialog-header">
          <h2>{getTitle()}</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dialog-content">
          <div className="dialog-content-scroll">
            {analysis && (
              <div className="move-comparison">
                {/* 順位表示 */}
                {analysis.rank && analysis.totalMoves && (
                  <div className="move-ranking">
                    <h3>手の評価</h3>
                    <div className="ranking-display">
                      <span
                        className={`ranking-text ${analysis.rank === 1 ? 'best-move' : analysis.percentile && analysis.percentile < 20 ? 'bad-move' : ''}`}
                      >
                        {analysis.rank === 1
                          ? '最善手です！'
                          : `${analysis.totalMoves}手中${analysis.rank}位`}
                        {analysis.percentile &&
                          analysis.rank !== 1 &&
                          ` (上位${analysis.percentile.toFixed(0)}%)`}
                      </span>
                    </div>
                  </div>
                )}

                <BoardDisplay board={boardBeforeMove} title="手を打つ前の盤面" highlights={[]} />

                {/* 左右ペイン：プレイヤーの手とAI推奨手の比較 */}
                <div className="boards-comparison">
                  <div className="board-section">
                    <div className="board-subsection">
                      <BoardDisplay
                        board={boardAfterPlayerMove}
                        title="あなたの手"
                        highlights={[playerMove]}
                        highlightType="player-move"
                      />
                      <EvaluationSummary
                        playerScore={(() => {
                          const { blackScore, whiteScore } =
                            getNormalizedScores(playerMoveEvaluation);
                          return playerColor === 'black' ? blackScore : whiteScore;
                        })()}
                        aiScore={(() => {
                          const { blackScore, whiteScore } =
                            getNormalizedScores(playerMoveEvaluation);
                          return playerColor === 'black' ? whiteScore : blackScore;
                        })()}
                        explanation={playerMoveExplanation}
                      />
                    </div>
                  </div>

                  {aiRecommendedMove && (
                    <div className="board-section">
                      <div className="board-subsection">
                        <BoardDisplay
                          board={boardAfterAIRecommendation}
                          title="AIの推奨手"
                          highlights={[aiRecommendedMove]}
                          highlightType="ai-recommendation"
                        />
                        <EvaluationSummary
                          playerScore={(() => {
                            const { blackScore, whiteScore } = getNormalizedScores(
                              aiRecommendationEvaluation
                            );
                            return playerColor === 'black' ? blackScore : whiteScore;
                          })()}
                          aiScore={(() => {
                            const { blackScore, whiteScore } = getNormalizedScores(
                              aiRecommendationEvaluation
                            );
                            return playerColor === 'black' ? whiteScore : blackScore;
                          })()}
                          explanation={aiMoveExplanation}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {!analysis?.detailedAnalysis && (
              <div className="explanation-text">
                <pre>{analysis?.explanation || ''}</pre>
              </div>
            )}

            {analysis?.allMoves && analysis.allMoves.length > 0 && (
              <MoveList
                moves={analysis.allMoves}
                playerMove={playerMove}
                playerColor={playerColor}
              />
            )}
          </div>

          {analysis.isBadMove && onUndo && (
            <div className="dialog-actions">
              <button type="button" className="undo-button" onClick={onUndo}>
                打ち直す
              </button>
              <button type="button" className="continue-button" onClick={onClose}>
                このまま続ける
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
