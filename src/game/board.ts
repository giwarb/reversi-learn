import { BOARD_SIZE } from './constants';
import type { Board } from './types';

export const createInitialBoard = (): Board => {
  const board: Board = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(null));

  const center = Math.floor(BOARD_SIZE / 2);
  board[center - 1][center - 1] = 'white';
  board[center - 1][center] = 'black';
  board[center][center - 1] = 'black';
  board[center][center] = 'white';

  return board;
};

export const copyBoard = (board: Board): Board => {
  return board.map((row) => [...row]);
};

export const countPieces = (board: Board): { black: number; white: number; empty: number } => {
  let black = 0;
  let white = 0;
  let empty = 0;

  for (const row of board) {
    for (const cell of row) {
      if (cell === 'black') black++;
      else if (cell === 'white') white++;
      else empty++;
    }
  }

  return { black, white, empty };
};
