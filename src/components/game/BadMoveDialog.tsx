import { type FC, useEffect, useMemo } from 'react';
import type { BadMoveResult } from '../../game/badMoveDetector';
import { getValidMove, makeMove } from '../../game/rules';
import type { Board, Player, Position } from '../../game/types';
import { getNormalizedScores } from '../../utils/evaluationNormalizer';
import { evaluateBoard } from '../../ai/evaluation';
import { findBestMove } from '../../ai/minimax';
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
  const opponent: Player = playerColor === 'black' ? 'white' : 'black';
  // 盤面A: 初期盤面（プレイヤーが打つ前）
  const boardA = initialBoard;
  
  // 盤面B: A + プレイヤーの手p1
  const boardB = useMemo(() => {
    const validMove = getValidMove(boardA, playerMove, playerColor);
    if (!validMove) return boardA;
    return makeMove(boardA, validMove, playerColor);
  }, [boardA, playerMove, playerColor]);
  
  // 相手の最善応手p2（Bに対して）
  const opponentResponseP2 = useMemo(() => {
    const bestMove = findBestMove(boardB, opponent, aiDepth);
    return bestMove?.position || null;
  }, [boardB, opponent, aiDepth]);
  
  // 盤面C: B + 相手の最善応手p2
  const boardC = useMemo(() => {
    if (!opponentResponseP2) return boardB;
    const validMove = getValidMove(boardB, opponentResponseP2, opponent);
    if (!validMove) return boardB;
    return makeMove(boardB, validMove, opponent);
  }, [boardB, opponentResponseP2, opponent]);

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
  
  // 相手の最善応手p4（Dに対して）
  const opponentResponseP4 = useMemo(() => {
    const bestMove = findBestMove(boardD, opponent, aiDepth);
    return bestMove?.position || null;
  }, [boardD, opponent, aiDepth]);
  
  // 盤面E: D + 相手の最善応手p4
  const boardE = useMemo(() => {
    if (!opponentResponseP4) return boardD;
    const validMove = getValidMove(boardD, opponentResponseP4, opponent);
    if (!validMove) return boardD;
    return makeMove(boardD, validMove, opponent);
  }, [boardD, opponentResponseP4, opponent]);

  // 各盤面の評価値を計算
  const evalA = useMemo(() => evaluateBoard(boardA, playerColor), [boardA, playerColor]);
  const evalB = useMemo(() => evaluateBoard(boardB, playerColor), [boardB, playerColor]);
  const evalC = useMemo(() => evaluateBoard(boardC, playerColor), [boardC, playerColor]);
  const evalD = useMemo(() => evaluateBoard(boardD, playerColor), [boardD, playerColor]);
  const evalE = useMemo(() => evaluateBoard(boardE, playerColor), [boardE, playerColor]);


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
    if (analysis.explanation.includes('最善手を選びました')) {
      return '素晴らしい！';
    }
    if (analysis.isBadMove) {
      return '悪手です';
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
            {analysis.detailedAnalysis && (
              <div className="move-comparison">
              {/* 初期評価値表示 */}
              <div className="initial-evaluation">
                <h3>手を打つ前の評価値</h3>
                <div className="evaluation-display">
                  {(() => {
                    const { blackScore, whiteScore } = getNormalizedScores(
                      playerColor === 'black' ? evalA : -evalA,
                      playerColor === 'white' ? evalA : -evalA
                    );
                    const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                    const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                    return (
                      <span className="eval-score">
                        あなた: {playerScore.toFixed(1)} vs AI: {aiScore.toFixed(1)}
                      </span>
                    );
                  })()}
                </div>
              </div>

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

              {/* 左下・右下ペイン */}
              <div className="boards-comparison">
                {/* 左下ペイン：プレイヤーの手の流れ */}
                <div className="board-section">
                  <h3>あなたの手の結果</h3>
                  
                  {/* プレイヤーが打った直後 */}
                  <div className="board-subsection">
                    <h4>手を打った直後</h4>
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
                    </div>
                  </div>

                  {/* 相手が応手した後 */}
                  {opponentResponseP2 && (
                    <div className="board-subsection">
                      <h4>相手の応手後</h4>
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
                            {boardC.map((row, rowIndex) => (
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
                                      {
                                        row: opponentResponseP2.row,
                                        col: opponentResponseP2.col,
                                        type: 'opponent-response',
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
                              playerColor === 'black' ? evalC : -evalC,
                              playerColor === 'white' ? evalC : -evalC
                            );
                            const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                            const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                            return `あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`;
                          })()}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 右下ペイン：推奨手の流れ */}
                {aiRecommendationP3 && (
                  <div className="board-section">
                    <h3>推奨手の結果</h3>
                    
                    {/* 推奨手を打った直後 */}
                    <div className="board-subsection">
                      <h4>推奨手を打った直後</h4>
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
                      </div>
                    </div>

                    {/* 相手が応手した後 */}
                    {opponentResponseP4 && (
                      <div className="board-subsection">
                        <h4>相手の応手後</h4>
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
                              {boardE.map((row, rowIndex) => (
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
                                        {
                                          row: opponentResponseP4.row,
                                          col: opponentResponseP4.col,
                                          type: 'opponent-response',
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
                                playerColor === 'black' ? evalE : -evalE,
                                playerColor === 'white' ? evalE : -evalE
                              );
                              const playerScore = playerColor === 'black' ? blackScore : whiteScore;
                              const aiScore = playerColor === 'black' ? whiteScore : blackScore;
                              return `あなた: ${playerScore.toFixed(1)} vs AI: ${aiScore.toFixed(1)}`;
                            })()}
                          </div>
                        </div>
                      </div>
                    )}
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
