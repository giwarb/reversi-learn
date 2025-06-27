import type { Position } from '../game/types';

/**
 * リバーシの戦略的位置の定数定義
 * コーナー、X-square、C-square等の重要位置を一元管理
 */

export const STRATEGIC_POSITIONS = {
  /** コーナー（角）の位置 */
  CORNERS: [
    { row: 0, col: 0 },
    { row: 0, col: 7 },
    { row: 7, col: 0 },
    { row: 7, col: 7 },
  ] as const satisfies readonly Position[],

  /** X-square（コーナーの斜め隣）の位置 */
  X_SQUARES: [
    { row: 1, col: 1 },
    { row: 1, col: 6 },
    { row: 6, col: 1 },
    { row: 6, col: 6 },
  ] as const satisfies readonly Position[],

  /** C-square（コーナーの隣接位置）の位置 */
  C_SQUARES: [
    // 左上コーナー周辺
    { row: 0, col: 1 },
    { row: 1, col: 0 },
    // 右上コーナー周辺
    { row: 0, col: 6 },
    { row: 1, col: 7 },
    // 左下コーナー周辺
    { row: 6, col: 0 },
    { row: 7, col: 1 },
    // 右下コーナー周辺
    { row: 6, col: 7 },
    { row: 7, col: 6 },
    // エッジのC-square
    { row: 2, col: 0 },
    { row: 0, col: 2 },
    { row: 5, col: 7 },
    { row: 7, col: 5 },
  ] as const satisfies readonly Position[],
} as const;
