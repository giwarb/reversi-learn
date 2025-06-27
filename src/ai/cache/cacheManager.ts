import { globalBoardCache } from './boardCache';
import { globalValidMovesCache } from './validMovesCache';

export interface CacheStatistics {
  boardCache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  validMovesCache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
  combined: {
    totalHits: number;
    totalMisses: number;
    totalHitRate: number;
  };
}

export function clearAllCaches(): void {
  try {
    globalBoardCache.clear();
    globalValidMovesCache.clear();
  } catch (error) {
    console.error('Failed to clear caches:', error);
  }
}

export function getCacheStats(): CacheStatistics {
  const boardStats = globalBoardCache.getStats();
  const validMovesStats = globalValidMovesCache.getStats();

  // hitRateを文字列から数値に変換
  const boardHitRate = Number.parseFloat(boardStats.hitRate.replace('%', '')) / 100;
  const validMovesHitRate = Number.parseFloat(validMovesStats.hitRate.replace('%', '')) / 100;

  const totalHits = boardStats.hits + validMovesStats.hits;
  const totalMisses = boardStats.misses + validMovesStats.misses;
  const totalAttempts = totalHits + totalMisses;
  const totalHitRate = totalAttempts > 0 ? totalHits / totalAttempts : 0;

  return {
    boardCache: {
      hits: boardStats.hits,
      misses: boardStats.misses,
      hitRate: boardHitRate,
    },
    validMovesCache: {
      hits: validMovesStats.hits,
      misses: validMovesStats.misses,
      hitRate: validMovesHitRate,
    },
    combined: {
      totalHits,
      totalMisses,
      totalHitRate,
    },
  };
}

export function clearCachesOnGameStart(): void {
  clearAllCaches();
}

export function clearCachesOnGameEnd(): void {
  clearAllCaches();
}
