import type { Board, Position } from '../../game/types';
import { computeBoardHash } from './zobristHash';

interface CacheEntry {
  evaluation: number;
  bestMove: Position | null;
  depth: number;
  timestamp: number;
}

/**
 * LRU（Least Recently Used）キャッシュを使った盤面キャッシュ
 * トランスポジションテーブルとして機能
 */
export class BoardCache {
  private cache: Map<string, CacheEntry>;
  private readonly maxSize: number;
  private hits: number = 0;
  private misses: number = 0;

  constructor(maxSize: number = 100000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  /**
   * キャッシュから評価値を取得
   */
  get(board: Board, depth: number): CacheEntry | null {
    const key = computeBoardHash(board);
    const entry = this.cache.get(key);

    if (entry && entry.depth >= depth) {
      // キャッシュヒット
      this.hits++;
      // LRU更新のため、エントリを削除して再追加
      this.cache.delete(key);
      this.cache.set(key, { ...entry, timestamp: Date.now() });
      return entry;
    }

    // キャッシュミス
    this.misses++;
    return null;
  }

  /**
   * キャッシュに評価値を保存
   */
  set(board: Board, evaluation: number, bestMove: Position | null, depth: number): void {
    const key = computeBoardHash(board);
    
    // 既存のエントリがある場合、より深い探索結果のみ保存
    const existing = this.cache.get(key);
    if (existing && existing.depth > depth) {
      return;
    }

    // キャッシュサイズ制限に達した場合、最も古いエントリを削除
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      evaluation,
      bestMove,
      depth,
      timestamp: Date.now(),
    });
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
      hitRate: hitRate.toFixed(2) + '%',
      size: this.cache.size,
      maxSize: this.maxSize,
    };
  }

  /**
   * キャッシュサイズを取得
   */
  get size(): number {
    return this.cache.size;
  }
}

// グローバルキャッシュインスタンス
export const globalBoardCache = new BoardCache();