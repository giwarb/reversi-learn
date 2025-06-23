export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = Cell[][];
export type Position = { row: number; col: number };

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | 'draw' | null;
  moveHistory: Position[];
}

export interface ValidMove extends Position {
  flips: Position[];
}
