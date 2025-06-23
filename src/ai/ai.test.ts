import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../game/board';
import { ReversiAI } from './ai';

describe('ReversiAI', () => {
  it('AIインスタンスを作成できる', () => {
    const ai = new ReversiAI({ maxDepth: 4 });
    expect(ai).toBeInstanceOf(ReversiAI);
  });

  it('有効な手を返す', () => {
    const ai = new ReversiAI({ maxDepth: 3 });
    const board = createInitialBoard();
    const move = ai.getMove(board, 'black');

    expect(move).not.toBeNull();
    expect(move).toHaveProperty('row');
    expect(move).toHaveProperty('col');
  });

  it('深さを設定・取得できる', () => {
    const ai = new ReversiAI({ maxDepth: 4 });

    expect(ai.getDepth()).toBe(4);

    ai.setDepth(6);
    expect(ai.getDepth()).toBe(6);

    // 範囲外の値は制限される
    ai.setDepth(15);
    expect(ai.getDepth()).toBe(10);

    ai.setDepth(0);
    expect(ai.getDepth()).toBe(1);
  });

  it('評価情報を含む結果を返す', () => {
    const ai = new ReversiAI({ maxDepth: 3 });
    const board = createInitialBoard();
    const evaluation = ai.evaluateMove(board, 'black');

    expect(evaluation).not.toBeNull();
    expect(evaluation?.score).toBeDefined();
    expect(evaluation?.depth).toBe(3);
  });
});
