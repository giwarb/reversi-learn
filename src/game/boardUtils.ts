import { BOARD_SIZE } from './constants';
import type { Board, Position } from './types';

export const isCorner = (pos: Position): boolean => {
  return (
    (pos.row === 0 || pos.row === BOARD_SIZE - 1) && (pos.col === 0 || pos.col === BOARD_SIZE - 1)
  );
};

export const isEdge = (pos: Position): boolean => {
  return pos.row === 0 || pos.row === BOARD_SIZE - 1 || pos.col === 0 || pos.col === BOARD_SIZE - 1;
};

export const isXSquare = (pos: Position): boolean => {
  return (
    (pos.row === 1 || pos.row === BOARD_SIZE - 2) && (pos.col === 1 || pos.col === BOARD_SIZE - 2)
  );
};

export const isCSquare = (pos: Position): boolean => {
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
  ];

  return corners.some((corner) => {
    const diffRow = Math.abs(pos.row - corner.row);
    const diffCol = Math.abs(pos.col - corner.col);
    return (diffRow === 0 && diffCol === 1) || (diffRow === 1 && diffCol === 0);
  });
};

export const getAdjacentCorner = (pos: Position): Position => {
  const row = pos.row <= 1 ? 0 : BOARD_SIZE - 1;
  const col = pos.col <= 1 ? 0 : BOARD_SIZE - 1;
  return { row, col };
};

export const getAdjacentToCorner = (corner: Position): Position[] => {
  const adjacent: Position[] = [];
  const { row, col } = corner;

  // 角の隣接マス（X-square と C-square）
  if (row === 0 && col === 0) {
    adjacent.push({ row: 0, col: 1 }, { row: 1, col: 0 }, { row: 1, col: 1 });
  } else if (row === 0 && col === BOARD_SIZE - 1) {
    adjacent.push(
      { row: 0, col: BOARD_SIZE - 2 },
      { row: 1, col: BOARD_SIZE - 1 },
      { row: 1, col: BOARD_SIZE - 2 }
    );
  } else if (row === BOARD_SIZE - 1 && col === 0) {
    adjacent.push(
      { row: BOARD_SIZE - 1, col: 1 },
      { row: BOARD_SIZE - 2, col: 0 },
      { row: BOARD_SIZE - 2, col: 1 }
    );
  } else if (row === BOARD_SIZE - 1 && col === BOARD_SIZE - 1) {
    adjacent.push(
      { row: BOARD_SIZE - 1, col: BOARD_SIZE - 2 },
      { row: BOARD_SIZE - 2, col: BOARD_SIZE - 1 },
      { row: BOARD_SIZE - 2, col: BOARD_SIZE - 2 }
    );
  }

  return adjacent;
};

export const getAllCorners = (): Position[] => {
  return [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
  ];
};

export const copyBoard = (board: Board): Board => {
  return board.map((row) => [...row]);
};
