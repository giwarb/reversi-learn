import { describe, expect, it } from 'vitest';
import { createInitialBoard } from './board';
import { getAllValidMoves, getOpponent, getValidMove, makeMove } from './rules';

describe('getOpponent', () => {
  it('相手プレイヤーを返す', () => {
    expect(getOpponent('black')).toBe('white');
    expect(getOpponent('white')).toBe('black');
  });
});

describe('getValidMove', () => {
  it('初期位置で有効な手を検出する', () => {
    const board = createInitialBoard();
    const move = getValidMove(board, { row: 2, col: 3 }, 'black');

    expect(move).not.toBeNull();
    expect(move?.flips).toHaveLength(1);
    expect(move?.flips[0]).toEqual({ row: 3, col: 3 });
  });

  it('無効な手はnullを返す', () => {
    const board = createInitialBoard();
    const move = getValidMove(board, { row: 0, col: 0 }, 'black');

    expect(move).toBeNull();
  });
});

describe('getAllValidMoves', () => {
  it('黒の初期有効手は4つ', () => {
    const board = createInitialBoard();
    const moves = getAllValidMoves(board, 'black');

    expect(moves).toHaveLength(4);
  });

  it('白の初期有効手は4つ', () => {
    const board = createInitialBoard();
    const moves = getAllValidMoves(board, 'white');

    expect(moves).toHaveLength(4);
  });
});

describe('makeMove', () => {
  it('石を配置して反転させる', () => {
    const board = createInitialBoard();
    const move = getValidMove(board, { row: 2, col: 3 }, 'black');

    expect(move).not.toBeNull();
    if (!move) return;

    const newBoard = makeMove(board, move, 'black');

    expect(newBoard[2][3]).toBe('black');
    expect(newBoard[3][3]).toBe('black');
  });
});
