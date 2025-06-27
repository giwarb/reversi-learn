/**
 * AI関連の定数定義
 * ゲームバランスやAIの動作を調整するための設定値を一元管理
 */

export const AI_CONSTANTS = {
  /** AIのデフォルト思考時間制限（ミリ秒） */
  DEFAULT_TIME_LIMIT_MS: 5000,

  /** AIの最小思考時間（ユーザビリティ向上のため）（ミリ秒） */
  MIN_THINKING_TIME_MS: 500,
};

export const EVALUATION_CONSTANTS = {
  /** 評価値の最大値（勝敗確定時） */
  MAX_SCORE: 1000000,

  /** 評価値の最小値（勝敗確定時） */
  MIN_SCORE: -1000000,

  /** 正規化時の最大生スコア */
  MAX_NORMALIZED_SCORE: 200,

  /** 盤面評価の探索深度（AIレベルとは独立） */
  EVALUATION_DEPTH: 4,
};

export const GAME_PHASE_CONSTANTS = {
  /** 序盤の閾値（石数） */
  EARLY_GAME_THRESHOLD: 20,

  /** 中盤の閾値（石数） */
  MID_GAME_THRESHOLD: 40,

  /** 序盤の評価重み */
  EARLY_GAME_WEIGHTS: {
    /** モビリティ（着手可能数）の重み */
    MOBILITY: 5,
    /** 安定石の重み */
    STABILITY: 2,
    /** 石数の重み */
    PIECE_COUNT: 1,
  },

  /** 中盤の評価重み */
  MID_GAME_WEIGHTS: {
    /** モビリティ（着手可能数）の重み */
    MOBILITY: 3,
    /** 安定石の重み */
    STABILITY: 1,
    /** 石数の重み */
    PIECE_COUNT: 3,
    /** 位置評価の重み */
    POSITION: 0.5,
  },

  /** 終盤の評価重み */
  LATE_GAME_WEIGHTS: {
    /** 石数の重み */
    PIECE_COUNT: 1,
    /** 安定石の重み */
    STABILITY: 5,
    /** 位置評価の重み */
    POSITION: 3,
  },
} as const;

export const MOVE_QUALITY_CONSTANTS = {
  /** 悪手判定の閾値（パーセンタイル） */
  BAD_MOVE_THRESHOLD: 80,

  /** 大悪手判定の閾値（パーセンタイル） */
  TERRIBLE_MOVE_THRESHOLD: 20,

  /** より良い手を推奨する閾値（パーセンタイル） */
  SUGGEST_BETTER_THRESHOLD: 50,

  /** 互角ゲーム判定の閾値（評価値差） */
  EVEN_GAME_THRESHOLD: 5,

  /** やや有利判定の閾値（評価値差） */
  SLIGHT_ADVANTAGE_THRESHOLD: 15,

  /** 明確な有利判定の閾値（評価値差） */
  CLEAR_ADVANTAGE_THRESHOLD: 30,
} as const;

export const UI_CONSTANTS = {
  /** 通知表示時間（ミリ秒） */
  NOTIFICATION_DURATION_MS: 2000,

  /** 簡単レベルの閾値 */
  EASY_LEVEL_THRESHOLD: 2,

  /** 普通レベルの閾値 */
  MEDIUM_LEVEL_THRESHOLD: 4,
} as const;
