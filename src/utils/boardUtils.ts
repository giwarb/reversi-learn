import type { Position } from '../game/types';

export const getColumnLabel = (col: number): string => {
  return String.fromCharCode('a'.charCodeAt(0) + col);
};

export const getRowLabel = (row: number): string => {
  return String(row + 1);
};

export const positionToAlgebraic = (position: Position): string => {
  return `${getColumnLabel(position.col)}${getRowLabel(position.row)}`;
};

export const COLUMN_LABELS = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
export const ROW_LABELS = ['1', '2', '3', '4', '5', '6', '7', '8'];
