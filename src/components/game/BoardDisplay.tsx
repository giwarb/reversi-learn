import type { FC } from 'react';
import type { Board, Position } from '../../game/types';
import { COLUMN_LABELS, ROW_LABELS } from '../../utils/boardUtils';

export type HighlightType = 'player-move' | 'ai-recommendation' | 'danger' | 'opponent-response';

interface BoardDisplayProps {
  board: Board;
  title: string;
  highlights: Position[];
  highlightType?: HighlightType;
}

export const BoardDisplay: FC<BoardDisplayProps> = ({
  board,
  title,
  highlights,
  highlightType = 'player-move',
}) => {
  const getCellClass = (row: number, col: number): string => {
    const isHighlighted = highlights.some((h) => h.row === row && h.col === col);
    if (!isHighlighted) return '';

    switch (highlightType) {
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

  return (
    <div className="board-section">
      <h3>{title}</h3>
      <div className="mini-board">
        <div className="mini-board-with-labels">
          <div className="mini-corner-space" />
          <div className="mini-column-labels">
            {COLUMN_LABELS.map((label) => (
              <div key={label} className="mini-label">
                {label}
              </div>
            ))}
          </div>
          <div className="mini-row-labels">
            {ROW_LABELS.map((label) => (
              <div key={label} className="mini-label">
                {label}
              </div>
            ))}
          </div>
          <div className="board-grid">
            {board.map((row, rowIndex) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで行の順序は不変
              <div key={`row-${rowIndex}`} className="board-row">
                {row.map((cell, colIndex) => (
                  <div
                    // biome-ignore lint/suspicious/noArrayIndexKey: 固定サイズ(8x8)のゲームボードで列の順序は不変
                    key={`cell-${rowIndex}-${colIndex}`}
                    className={`board-cell ${getCellClass(rowIndex, colIndex)}`}
                  >
                    {cell && <div className={`stone ${cell}`} />}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
