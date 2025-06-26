import type { FC } from 'react';
import type { Board } from '../../game/types';

interface MiniBoardProps {
  board: Board;
  highlightedCells?: Array<{
    row: number;
    col: number;
    type: 'player-move' | 'ai-recommendation' | 'danger' | 'opponent-response';
  }>;
  title?: string;
}

const COL_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];

export const MiniBoard: FC<MiniBoardProps> = ({ board, highlightedCells = [], title }) => {
  const getCellClass = (row: number, col: number): string => {
    const highlight = highlightedCells.find((h) => h.row === row && h.col === col);
    if (highlight) {
      return highlight.type;
    }
    return '';
  };

  return (
    <div className="mini-board">
      {title && <h4>{title}</h4>}
      <div className="mini-board-container">
        <div className="mini-col-labels">
          {COL_LABELS.map((label) => (
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
            // biome-ignore lint/suspicious/noArrayIndexKey: Fixed size (8x8) game board with immutable row order
            <div key={rowIndex} className="board-row">
              {row.map((cell, colIndex) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: Fixed size (8x8) game board with immutable column order
                  key={`${rowIndex}-${colIndex}`}
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
  );
};
