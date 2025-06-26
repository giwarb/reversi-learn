import type { Board, Player, Position } from '../../game/types';
import { getBoardStateKey } from './zobristHash';

/**
 * 合法手のキャッシュ
 * getAllValidMovesの結果をキャッシュして重複計算を避ける
 */
export class ValidMovesCache {
  private cache: Map<string, Position[]>;
  private readonly maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 50000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * キャッシュから合法手を取得
   */
  get(board: Board, player: Player): Position[] | null {
    const key = getBoardStateKey(board, player);
    const moves = this.cache.get(key);

    if (moves) {
      this.hits++;
      // LRU更新のため再追加
      this.cache.delete(key);
      this.cache.set(key, moves);
      return moves;
    }

    this.misses++;
    return null;
  }

  /**
   * キャッシュに合法手を保存
   */
  set(board: Board, player: Player, moves: Position[]): void {
    const key = getBoardStateKey(board, player);

    // キャッシュサイズ制限
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, moves);
  }

  /**
   * キャッシュをクリア
   */
  clear(): void {
    this.cache.clear();
    this.hits = 0;
    this.misses = 0;
  }

  /**
   * キャッシュ統計を取得
   */
  getStats() {
    const total = this.hits + this.misses;
    const hitRate = total > 0 ? (this.hits / total) * 100 : 0;

    return {
      hits: this.hits,
      misses: this.misses,
      hitRate: `${hitRate.toFixed(2)}%`,
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }
}

// グローバルキャッシュインスタンス
export const globalValidMovesCache = new ValidMovesCache();
