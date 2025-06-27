import { type FC, useEffect, useMemo } from 'react';
import { explainBoardEvaluation, getBriefExplanation } from '../../ai/boardEvaluationExplainer';
import { minimax } from '../../ai/minimax';
import type { BadMoveResult } from '../../game/badMoveDetector';
import { getValidMove, makeMove } from '../../game/rules';
import type { Board, Player, Position } from '../../game/types';
import { getNormalizedScores } from '../../utils/evaluationNormalizer';
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
                        {boardBeforeMove.map((row, rowIndex) => (
                          // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで行の順序は不変
                          <div key={rowIndex} className="board-row">
                            {row.map((cell, colIndex) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで列の順序は不変
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
                            {boardAfterPlayerMove.map((row, rowIndex) => (
                              // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで行の順序は不変
                              <div key={rowIndex} className="board-row">
                                {row.map((cell, colIndex) => (
                                  <div
                                    // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで列の順序は不変
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
                            const { blackScore, whiteScore } =
                              getNormalizedScores(playerMoveEvaluation);
                            const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                            const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                            return `あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`;
                          })()}
                        </div>
                        <div className="board-analysis">
                          <h4>盤面分析</h4>
                          <div className="analysis-content">
                            <div className="overall-assessment">
                              {playerMoveExplanation.overallAssessment}
                            </div>
                            <pre className="explanation-details">
                              {getBriefExplanation(playerMoveExplanation)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 右ペイン：AIの推奨手 */}
                  {aiRecommendedMove && (
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
                              {boardAfterAIRecommendation.map((row, rowIndex) => (
                                // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで行の順序は不変
                                <div key={rowIndex} className="board-row">
                                  {row.map((cell, colIndex) => (
                                    <div
                                      // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで列の順序は不変
                                      key={`${rowIndex}-${colIndex}`}
                                      className={`board-cell ${getCellClass(rowIndex, colIndex, [
                                        {
                                          row: aiRecommendedMove.row,
                                          col: aiRecommendedMove.col,
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
                                aiRecommendationEvaluation
                              );
                              const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                              const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                              return `あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`;
                            })()}
                          </div>
                          <div className="board-analysis">
                            <h4>盤面分析</h4>
                            <div className="analysis-content">
                              <div className="overall-assessment">
                                {aiMoveExplanation.overallAssessment}
                              </div>
                              <pre className="explanation-details">
                                {getBriefExplanation(aiMoveExplanation)}
                              </pre>
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

            {/* 全ての合法手一覧 */}
            {analysis?.allMoves && analysis.allMoves.length > 0 && (
              <div className="all-moves-section">
                <h3>全ての合法手と評価値</h3>
                <div className="moves-list">
                  {analysis.allMoves.map((move, index) => {
                    const colLetter = String.fromCharCode('a'.charCodeAt(0) + move.position.col);
                    const rowNumber = move.position.row + 1;
                    const isPlayerMove =
                      move.position.row === playerMove.row && move.position.col === playerMove.col;
                    const isBestMove = index === 0;
                    const isBadMove = index >= (analysis.allMoves?.length || 0) * 0.8;

                    // 正規化されたスコアを取得
                    const normalizedScores = getNormalizedScores(move.score);
                    const playerNormalizedScore =
                      playerColor === 'black'
                        ? normalizedScores.blackScore
                        : normalizedScores.whiteScore;
                    const aiNormalizedScore =
                      playerColor === 'black'
                        ? normalizedScores.whiteScore
                        : normalizedScores.blackScore;

                    return (
                      <div
                        key={`${move.position.row}-${move.position.col}`}
                        className={`move-item ${isPlayerMove ? 'player-move' : ''} ${isBestMove && !isPlayerMove ? 'best-move' : ''} ${isBadMove && !isPlayerMove && !isBestMove ? 'bad-move' : ''}`}
                      >
                        <span className="move-rank">#{index + 1}</span>
                        <span className="move-position">
                          {colLetter}
                          {rowNumber}
                        </span>
                        <span className="move-evaluation">
                          {isPlayerMove && '(あなたの手)'}
                          {isBestMove && !isPlayerMove && '(最善手)'}
                        </span>
                        <span className="move-score">
                          {playerNormalizedScore.toFixed(1)} vs {aiNormalizedScore.toFixed(1)}
                          <span style={{ marginLeft: '8px', color: '#666' }}>
                            ({move.score > 0 ? '+' : ''}
                            {move.score.toFixed(0)}点)
                          </span>
                        </span>
                      </div>
                    );
                  })}
                </div>
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
