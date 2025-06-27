import { beforeEach, describe, expect, it, vi } from 'vitest';
import { globalBoardCache } from './boardCache';
import {
  clearAllCaches,
  clearCachesOnGameEnd,
  clearCachesOnGameStart,
  getCacheStats,
} from './cacheManager';
import { globalValidMovesCache } from './validMovesCache';

vi.mock('./boardCache', () => ({
  globalBoardCache: {
    clear: vi.fn(),
    getStats: vi.fn(() => ({ hits: 10, misses: 5, hitRate: '67.00%', size: 50, maxSize: 100000 })),
  },
}));

vi.mock('./validMovesCache', () => ({
  globalValidMovesCache: {
    clear: vi.fn(),
    getStats: vi.fn(() => ({ hits: 20, misses: 10, hitRate: '67.00%', size: 30, maxSize: 50000 })),
  },
}));

describe('Cache Manager', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('clearAllCaches', () => {
    it('should clear both board cache and valid moves cache', () => {
      clearAllCaches();

      expect(globalBoardCache.clear).toHaveBeenCalledTimes(1);
      expect(globalValidMovesCache.clear).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      vi.mocked(globalBoardCache.clear).mockImplementationOnce(() => {
        throw new Error('Board cache clear failed');
      });

      expect(() => clearAllCaches()).not.toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to clear caches:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });

  describe('getCacheStats', () => {
    it('should return combined statistics from both caches', () => {
      const stats = getCacheStats();

      expect(stats).toEqual({
        boardCache: {
          hits: 10,
          misses: 5,
          hitRate: 0.67,
        },
        validMovesCache: {
          hits: 20,
          misses: 10,
          hitRate: 0.67,
        },
        combined: {
          totalHits: 30,
          totalMisses: 15,
          totalHitRate: 0.6666666666666666,
        },
      });
    });

    it('should handle missing statistics gracefully', () => {
      vi.mocked(globalBoardCache.getStats).mockReturnValueOnce({
        hits: 0,
        misses: 0,
        hitRate: '0.00%',
        size: 0,
        maxSize: 100000,
      });
      vi.mocked(globalValidMovesCache.getStats).mockReturnValueOnce({
        hits: 0,
        misses: 0,
        hitRate: '0.00%',
        size: 0,
        maxSize: 50000,
      });

      const stats = getCacheStats();

      expect(stats.combined).toEqual({
        totalHits: 0,
        totalMisses: 0,
        totalHitRate: 0,
      });
    });
  });

  describe('clearCachesOnGameStart', () => {
    it('should clear all caches when called', () => {
      clearCachesOnGameStart();

      expect(globalBoardCache.clear).toHaveBeenCalledTimes(1);
      expect(globalValidMovesCache.clear).toHaveBeenCalledTimes(1);
    });
  });

  describe('clearCachesOnGameEnd', () => {
    it('should clear all caches when called', () => {
      clearCachesOnGameEnd();

      expect(globalBoardCache.clear).toHaveBeenCalledTimes(1);
      expect(globalValidMovesCache.clear).toHaveBeenCalledTimes(1);
    });
  });
});
