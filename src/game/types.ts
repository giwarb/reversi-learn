export type Player = 'black' | 'white';
export type Cell = Player | null;
export type Board = Cell[][];
export type Position = { row: number; col: number };

// 評価値用ブランド型
export type EvaluationScore = number & { _brand: 'EvaluationScore' };
export type NormalizedScore = number & { _brand: 'NormalizedScore' };
export type PieceCount = number & { _brand: 'PieceCount' };

// 定数
export const MIN_EVALUATION_SCORE = -1000000;
export const MAX_EVALUATION_SCORE = 1000000;
export const MIN_NORMALIZED_SCORE = 0;
export const MAX_NORMALIZED_SCORE = 100;
export const MIN_PIECE_COUNT = 0;
export const MAX_PIECE_COUNT = 64;

// 型安全な作成関数
export function createEvaluationScore(value: number): EvaluationScore {
  if (value < MIN_EVALUATION_SCORE || value > MAX_EVALUATION_SCORE) {
    throw new Error(
      `EvaluationScore must be between ${MIN_EVALUATION_SCORE} and ${MAX_EVALUATION_SCORE}`
    );
  }
  return value as EvaluationScore;
}

export function createNormalizedScore(value: number): NormalizedScore {
  if (value < MIN_NORMALIZED_SCORE || value > MAX_NORMALIZED_SCORE) {
    throw new Error(
      `NormalizedScore must be between ${MIN_NORMALIZED_SCORE} and ${MAX_NORMALIZED_SCORE}`
    );
  }
  return value as NormalizedScore;
}

export function createPieceCount(value: number): PieceCount {
  if (value < MIN_PIECE_COUNT || value > MAX_PIECE_COUNT) {
    throw new Error(`PieceCount must be between ${MIN_PIECE_COUNT} and ${MAX_PIECE_COUNT}`);
  }
  return value as PieceCount;
}

// 型安全な演算関数
export function addEvaluationScores(a: EvaluationScore, b: EvaluationScore): EvaluationScore {
  return createEvaluationScore((a as number) + (b as number));
}

export function negateEvaluationScore(score: EvaluationScore): EvaluationScore {
  const result = -(score as number);
  // Handle -0 case to ensure it becomes +0
  return createEvaluationScore(result === 0 ? 0 : result);
}

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
