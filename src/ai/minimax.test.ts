import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';
import { findBestMove } from './minimax';

describe('findBestMove', () => {
  it('初期状態で有効な手を返す', () => {
    const board = createInitialBoard();
    const move = findBestMove(board, 'black', 3);

    expect(move).not.toBeNull();
    expect(move?.position).toHaveProperty('row');
    expect(move?.position).toHaveProperty('col');
  });

  it('深さが深いほど計算時間がかかる', () => {
    const board = createInitialBoard();

    const start1 = Date.now();
    findBestMove(board, 'black', 1);
    const time1 = Date.now() - start1;

    const start2 = Date.now();
    findBestMove(board, 'black', 4);
    const time2 = Date.now() - start2;

    expect(time2).toBeGreaterThanOrEqual(time1);
  });

  it('有効な手がない場合はnullを返す', () => {
    const board = createInitialBoard();
    // すべてのマスを埋める
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        board[i][j] = 'black';
      }
    }

    const move = findBestMove(board, 'white', 3);
    expect(move).toBeNull();
  });
});
