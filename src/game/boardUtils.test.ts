import { describe, expect, it } from 'vitest';
import { createInitialBoard } from './board';
import { copyBoard } from './boardUtils';

describe('boardUtils', () => {
  describe('copyBoard', () => {
    it('ボードを正しくコピーする', () => {
      const original = createInitialBoard();
      const copy = copyBoard(original);

      // コピーが同じ内容であることを確認
      expect(copy).toEqual(original);

      // 別のオブジェクトであることを確認
      expect(copy).not.toBe(original);
      expect(copy[0]).not.toBe(original[0]);
    });

    it('コピー後の変更が元のボードに影響しない', () => {
      const original = createInitialBoard();
      const copy = copyBoard(original);

      // コピーを変更
      copy[0][0] = 'black';

      // 元のボードが変更されていないことを確認
      expect(original[0][0]).toBe(null);
      expect(copy[0][0]).toBe('black');
    });

    it('JSON.parse/stringifyより高速である', () => {
      const board = createInitialBoard();
      const iterations = 10000;

      // copyBoardの実行時間を測定
      const copyStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        copyBoard(board);
      }
      const copyTime = performance.now() - copyStart;

      // JSON.parse/stringifyの実行時間を測定
      const jsonStart = performance.now();
      for (let i = 0; i < iterations; i++) {
        JSON.parse(JSON.stringify(board));
      }
      const jsonTime = performance.now() - jsonStart;

      console.log(`copyBoard: ${copyTime.toFixed(2)}ms`);
      console.log(`JSON.parse/stringify: ${jsonTime.toFixed(2)}ms`);
      console.log(`改善率: ${((jsonTime / copyTime - 1) * 100).toFixed(1)}%`);

      // copyBoardの方が高速であることを確認
      expect(copyTime).toBeLessThan(jsonTime);
    });
  });
});
