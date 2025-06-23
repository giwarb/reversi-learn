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

  return (
    <div className="board-container">
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
  );
};
