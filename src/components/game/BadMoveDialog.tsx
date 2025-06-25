import { type FC, useEffect, useMemo } from 'react';
import type { BadMoveResult } from '../../game/badMoveDetector';
import { getValidMove, makeMove } from '../../game/rules';
import type { Board, Player, Position } from '../../game/types';
import { getNormalizedScores } from '../../utils/evaluationNormalizer';
import { evaluateBoard } from '../../ai/evaluation';
import { findBestMove } from '../../ai/minimax';
import { explainBoardEvaluation, getBriefExplanation } from '../../ai/boardEvaluationExplainer';
import './BadMoveDialog.css';

interface BadMoveDialogProps {
  analysis: BadMoveResult | null;
  initialBoard: Board;  // プレイヤーが打つ前の盤面A
  playerMove: Position; // プレイヤーの手p1
  playerColor: Player;
  aiDepth: number;
  onClose: () => void;
  onUndo?: () => void;
}

interface CellHighlight {
  row: number;
  col: number;
  type: 'player-move' | 'ai-recommendation' | 'danger' | 'opponent-response';
}

export const BadMoveDialog: FC<BadMoveDialogProps> = ({
  analysis,
  initialBoard,
  playerMove,
  playerColor,
  aiDepth,
  onClose,
  onUndo,
}) => {
  // 盤面A: 初期盤面（プレイヤーが打つ前）
  const boardA = initialBoard;
  
  // 盤面B: A + プレイヤーの手p1
  const boardB = useMemo(() => {
    const validMove = getValidMove(boardA, playerMove, playerColor);
    if (!validMove) return boardA;
    return makeMove(boardA, validMove, playerColor);
  }, [boardA, playerMove, playerColor]);

  // AIの推奨手p3（Aに対して）
  const aiRecommendationP3 = useMemo(() => {
    const bestMove = findBestMove(boardA, playerColor, aiDepth);
    return bestMove?.position || null;
  }, [boardA, playerColor, aiDepth]);
  
  // 盤面D: A + AIの推奨手p3
  const boardD = useMemo(() => {
    if (!aiRecommendationP3) return boardA;
    const validMove = getValidMove(boardA, aiRecommendationP3, playerColor);
    if (!validMove) return boardA;
    return makeMove(boardA, validMove, playerColor);
  }, [boardA, aiRecommendationP3, playerColor]);

  // 各盤面の評価値を計算
  const evalB = useMemo(() => evaluateBoard(boardB, playerColor), [boardB, playerColor]);
  const evalD = useMemo(() => evaluateBoard(boardD, playerColor), [boardD, playerColor]);
  
  // 各盤面の詳細分析
  const playerMoveExplanation = useMemo(() => explainBoardEvaluation(boardB, playerColor), [boardB, playerColor]);
  const aiMoveExplanation = useMemo(() => explainBoardEvaluation(boardD, playerColor), [boardD, playerColor]);


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

  const getCellClass = (row: number, col: number, highlights: CellHighlight[]): string => {
    const highlight = highlights.find((h) => h.row === row && h.col === col);
    if (!highlight) return '';

    switch (highlight.type) {
      case 'player-move':
        return 'highlight-player-move';
      case 'ai-recommendation':
        return 'highlight-ai-recommendation';
      case 'danger':
        return 'highlight-danger';
      case 'opponent-response':
        return 'highlight-opponent-response';
      default:
        return '';
    }
  };

  const columnLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];

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
                    <span className={`ranking-text ${analysis.rank === 1 ? 'best-move' : analysis.percentile && analysis.percentile < 20 ? 'bad-move' : ''}`}>
                      {analysis.rank === 1 ? '最善手です！' : `${analysis.totalMoves}手中${analysis.rank}位`}
                      {analysis.percentile && analysis.rank !== 1 && ` (上位${analysis.percentile.toFixed(0)}%)`}
                    </span>
                  </div>
                </div>
              )}

              {/* 手を打つ前の盤面（上ペイン） */}
              <div className="board-section">
                <h3>手を打つ前の盤面</h3>
                <div className="mini-board">
                  <div className="mini-board-with-labels">
                    <div className="mini-corner-space" />
                    <div className="mini-column-labels">
                      {columnLabels.map((label) => (
                        <div key={label} className="mini-label">
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="mini-row-labels">
                      {rowLabels.map((label) => (
                        <div key={label} className="mini-label">
                          {label}
                        </div>
                      ))}
                    </div>
                    <div className="board-grid">
                      {boardA.map((row, rowIndex) => (
                        <div key={rowIndex} className="board-row">
                          {row.map((cell, colIndex) => (
                            <div key={`${rowIndex}-${colIndex}`} className="board-cell">
                              {cell && <div className={`stone ${cell}`} />}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* 左右ペイン：プレイヤーの手とAI推奨手の比較 */}
              <div className="boards-comparison">
                {/* 左ペイン：プレイヤーの手 */}
                <div className="board-section">
                  <h3>あなたの手</h3>
                  <div className="board-subsection">
                    <div className="mini-board">
                      <div className="mini-board-with-labels">
                        <div className="mini-corner-space" />
                        <div className="mini-column-labels">
                          {columnLabels.map((label) => (
                            <div key={label} className="mini-label">
                              {label}
                            </div>
                          ))}
                        </div>
                        <div className="mini-row-labels">
                          {rowLabels.map((label) => (
                            <div key={label} className="mini-label">
                              {label}
                            </div>
                          ))}
                        </div>
                        <div className="board-grid">
                          {boardB.map((row, rowIndex) => (
                            <div key={rowIndex} className="board-row">
                              {row.map((cell, colIndex) => (
                                <div
                                  key={`${rowIndex}-${colIndex}`}
                                  className={`board-cell ${getCellClass(rowIndex, colIndex, [
                                    {
                                      row: playerMove.row,
                                      col: playerMove.col,
                                      type: 'player-move',
                                    },
                                  ])}`}
                                >
                                  {cell && <div className={`stone ${cell}`} />}
                                </div>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="board-evaluation">
                      <div className="eval-score">
                        {(() => {
                          const { blackScore, whiteScore } = getNormalizedScores(
                            playerColor === 'black' ? evalB : -evalB,
                            playerColor === 'white' ? evalB : -evalB
                          );
                          const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                          const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                          return `あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`;
                        })()}
                      </div>
                      <div className="board-analysis">
                        <h4>盤面分析</h4>
                        <div className="analysis-content">
                          <div className="overall-assessment">{playerMoveExplanation.overallAssessment}</div>
                          <pre className="explanation-details">{getBriefExplanation(playerMoveExplanation)}</pre>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 右ペイン：AIの推奨手 */}
                {aiRecommendationP3 && (
                  <div className="board-section">
                    <h3>AIの推奨手</h3>
                    <div className="board-subsection">
                      <div className="mini-board">
                        <div className="mini-board-with-labels">
                          <div className="mini-corner-space" />
                          <div className="mini-column-labels">
                            {columnLabels.map((label) => (
                              <div key={label} className="mini-label">
                                {label}
                              </div>
                            ))}
                          </div>
                          <div className="mini-row-labels">
                            {rowLabels.map((label) => (
                              <div key={label} className="mini-label">
                                {label}
                              </div>
                            ))}
                          </div>
                          <div className="board-grid">
                            {boardD.map((row, rowIndex) => (
                              <div key={rowIndex} className="board-row">
                                {row.map((cell, colIndex) => (
                                  <div
                                    key={`${rowIndex}-${colIndex}`}
                                    className={`board-cell ${getCellClass(rowIndex, colIndex, [
                                      {
                                        row: aiRecommendationP3.row,
                                        col: aiRecommendationP3.col,
                                        type: 'ai-recommendation',
                                      },
                                    ])}`}
                                  >
                                    {cell && <div className={`stone ${cell}`} />}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="board-evaluation">
                        <div className="eval-score">
                          {(() => {
                            const { blackScore, whiteScore } = getNormalizedScores(
                              playerColor === 'black' ? evalD : -evalD,
                              playerColor === 'white' ? evalD : -evalD
                            );
                            const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                            const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                            return `あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`;
                          })()}
                        </div>
                        <div className="board-analysis">
                          <h4>盤面分析</h4>
                          <div className="analysis-content">
                            <div className="overall-assessment">{aiMoveExplanation.overallAssessment}</div>
                            <pre className="explanation-details">{getBriefExplanation(aiMoveExplanation)}</pre>
                          </div>
                        </div>
                      </div>
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
