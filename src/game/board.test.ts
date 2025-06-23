import { describe, expect, it } from 'vitest';
import { countPieces, createInitialBoard } from './board';

describe('createInitialBoard', () => {
  it('初期ボードを正しく作成する', () => {
    const board = createInitialBoard();

    expect(board.length).toBe(8);
    expect(board[0].length).toBe(8);
    expect(board[3][3]).toBe('white');
    expect(board[3][4]).toBe('black');
    expect(board[4][3]).toBe('black');
    expect(board[4][4]).toBe('white');
  });

  it('初期配置以外は空である', () => {
    const board = createInitialBoard();
    const counts = countPieces(board);

    expect(counts.black).toBe(2);
    expect(counts.white).toBe(2);
    expect(counts.empty).toBe(60);
  });
});

describe('countPieces', () => {
  it('石の数を正しくカウントする', () => {
    const board = createInitialBoard();
    const counts = countPieces(board);

    expect(counts.black).toBe(2);
    expect(counts.white).toBe(2);
    expect(counts.empty).toBe(60);
  });
});
