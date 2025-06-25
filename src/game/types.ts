export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = Cell[][];
export type Position = { row: number; col: number };

export interface MoveHistoryEntry {
  type: 'move' | 'pass';
  position?: Position;
  player: Player;
  boardBefore: Board;
  boardAfter: Board;
}

export interface GameState {
  board: Board;
  currentPlayer: Player;
  gameOver: boolean;
  winner: Player | 'draw' | null;
  moveHistory: Position[]; // 後方互換性のため残す
  fullMoveHistory: MoveHistoryEntry[]; // 新しい詳細履歴
}

export interface ValidMove extends Position {
  flips: Position[];
}
