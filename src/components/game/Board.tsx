import type { FC } from 'react';
import type { Board as BoardType, Position } from '../../game/types';
import './Board.css';

interface BoardProps {
  board: BoardType;
  validMoves: Position[];
  lastMove: Position | null;
  onCellClick: (position: Position) => void;
  isDisabled?: boolean;
}

export const Board: FC<BoardProps> = ({
  board,
  validMoves,
  lastMove,
  onCellClick,
  isDisabled = false,
}) => {
  const isValidMove = (row: number, col: number): boolean => {
    return validMoves.some((move) => move.row === row && move.col === col);
  };

  const isLastMove = (row: number, col: number): boolean => {
    return lastMove !== null && lastMove.row === row && lastMove.col === col;
  };

  const columnLabels = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const rowLabels = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <div className="board-container">
      <div className="board-with-labels">
        <div className="corner-space" />
        <div className="column-labels">
          {columnLabels.map((label) => (
            <div key={label} className="label column-label">
              {label}
            </div>
          ))}
        </div>
        <div className="row-labels">
          {rowLabels.map((label) => (
            <div key={label} className="label row-label">
              {label}
            </div>
          ))}
        </div>
        <div className="board">
          {board.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <button
                key={`${rowIndex}-${colIndex}`}
                type="button"
                className={`cell ${isValidMove(rowIndex, colIndex) ? 'valid-move' : ''} ${
                  isLastMove(rowIndex, colIndex) ? 'last-move' : ''
                }`}
                onClick={() => onCellClick({ row: rowIndex, col: colIndex })}
                disabled={isDisabled || !isValidMove(rowIndex, colIndex)}
              >
                {cell && <div className={`stone ${cell}`} />}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
