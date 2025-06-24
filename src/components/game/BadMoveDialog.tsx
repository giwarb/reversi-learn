import { type FC, useEffect } from 'react';
import type { BadMoveResult } from '../../game/badMoveDetector';
import type { Board } from '../../game/types';
import './BadMoveDialog.css';

interface BadMoveDialogProps {
  analysis: BadMoveResult | null;
  board: Board;
  onClose: () => void;
  onUndo?: () => void;
}

interface CellHighlight {
  row: number;
  col: number;
  type: 'player-move' | 'ai-recommendation' | 'danger' | 'opponent-response';
}

export const BadMoveDialog: FC<BadMoveDialogProps> = ({ analysis, board, onClose, onUndo }) => {
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

  const getHighlightedCells = (): CellHighlight[] => {
    const highlights: CellHighlight[] = [];

    // プレイヤーの手
    highlights.push({
      row: analysis.playerMove.row,
      col: analysis.playerMove.col,
      type: 'player-move',
    });

    // AIの推奨手
    if (analysis.aiRecommendation) {
      highlights.push({
        row: analysis.aiRecommendation.row,
        col: analysis.aiRecommendation.col,
        type: 'ai-recommendation',
      });
    }

    // 詳細分析がある場合
    if (analysis.detailedAnalysis) {
      // 危険な位置（影響を受ける位置）
      analysis.detailedAnalysis.impacts.forEach((impact) => {
        impact.affectedPositions.forEach((pos) => {
          highlights.push({
            row: pos.row,
            col: pos.col,
            type: 'danger',
          });
        });
      });

      // 相手の応手
      if (analysis.detailedAnalysis.opponentBestResponse) {
        highlights.push({
          row: analysis.detailedAnalysis.opponentBestResponse.row,
          col: analysis.detailedAnalysis.opponentBestResponse.col,
          type: 'opponent-response',
        });
      }
    }

    return highlights;
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

  const highlights = getHighlightedCells();

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
          {analysis.isBadMove && (
            <div className="mini-board">
              <div className="board-grid">
                {board.map((row, rowIndex) => (
                  <div key={rowIndex} className="board-row">
                    {row.map((cell, colIndex) => (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        className={`board-cell ${getCellClass(rowIndex, colIndex, highlights)}`}
                      >
                        {cell && <div className={`stone ${cell}`} />}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
              <div className="legend">
                <div className="legend-item">
                  <span className="legend-color highlight-player-move" />
                  あなたの手
                </div>
                <div className="legend-item">
                  <span className="legend-color highlight-ai-recommendation" />
                  推奨手
                </div>
                {highlights.some((h) => h.type === 'danger') && (
                  <div className="legend-item">
                    <span className="legend-color highlight-danger" />
                    危険な位置
                  </div>
                )}
                {highlights.some((h) => h.type === 'opponent-response') && (
                  <div className="legend-item">
                    <span className="legend-color highlight-opponent-response" />
                    相手の応手
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="explanation-text">
            <pre>{analysis.explanation}</pre>
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
