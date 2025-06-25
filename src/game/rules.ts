import { globalValidMovesCache } from '../ai/cache/validMovesCache';
import { BOARD_SIZE, DIRECTIONS } from './constants';
import type { Board, Player, Position, ValidMove } from './types';

export const getOpponent = (player: Player): Player => {
  return player === 'black' ? 'white' : 'black';
};

export const isValidPosition = (row: number, col: number): boolean => {
  return row >= 0 && row < BOARD_SIZE && col >= 0 && col < BOARD_SIZE;
};

export const getFlipsInDirection = (
  board: Board,
  position: Position,
  direction: { row: number; col: number },
  player: Player
): Position[] => {
  const flips: Position[] = [];
  const opponent = getOpponent(player);
  let row = position.row + direction.row;
  let col = position.col + direction.col;

  while (isValidPosition(row, col) && board[row][col] === opponent) {
    flips.push({ row, col });
    row += direction.row;
    col += direction.col;
  }

  if (isValidPosition(row, col) && board[row][col] === player && flips.length > 0) {
    return flips;
  }

  return [];
};

export const getValidMove = (
  board: Board,
  position: Position,
  player: Player
): ValidMove | null => {
  if (board[position.row][position.col] !== null) {
    return null;
  }

  const allFlips: Position[] = [];

  for (const direction of DIRECTIONS) {
    const flips = getFlipsInDirection(board, position, direction, player);
    allFlips.push(...flips);
  }

  if (allFlips.length === 0) {
    return null;
  }

  return { ...position, flips: allFlips };
};

export const getAllValidMoves = (board: Board, player: Player): ValidMove[] => {
  // キャッシュから取得を試みる
  const cached = globalValidMovesCache.get(board, player);
  if (cached !== null) {
    // ValidMove型に変換して返す
    return cached.map(pos => {
      const move = getValidMove(board, pos, player);
      return move!; // キャッシュされた位置は必ず有効
    });
  }

  // キャッシュミスの場合は計算
  const validMoves: ValidMove[] = [];
  const positions: Position[] = [];

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      const move = getValidMove(board, { row, col }, player);
      if (move) {
        validMoves.push(move);
        positions.push({ row: move.row, col: move.col });
      }
    }
  }

  // 結果をキャッシュに保存
  globalValidMovesCache.set(board, player, positions);

  return validMoves;
};

export const makeMove = (board: Board, move: ValidMove, player: Player): Board => {
  const newBoard = board.map((row) => [...row]);
  newBoard[move.row][move.col] = player;

  for (const flip of move.flips) {
    newBoard[flip.row][flip.col] = player;
  }

  return newBoard;
};
