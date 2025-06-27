import type { Position } from '../game/types';

/**
 * 指定された位置が角（コーナー）かどうかを判定する
 */
export const isCorner = (position: Position): boolean => {
  return (position.row === 0 || position.row === 7) && (position.col === 0 || position.col === 7);
};

/**
 * 指定された位置が辺（エッジ）かどうかを判定する
 * 注：角も辺に含まれる
 */
export const isEdge = (position: Position): boolean => {
  return position.row === 0 || position.row === 7 || position.col === 0 || position.col === 7;
};

/**
 * 手の位置に基づく優先度を取得する
 * @param position 手の位置
 * @returns 優先度（2: 角, 1: 辺, 0: 中央）
 */
export const getMovePositionPriority = (position: Position): number => {
  if (isCorner(position)) {
    return 2; // 角は最高優先度
  }
  if (isEdge(position)) {
    return 1; // 辺は中程度の優先度
  }
  return 0; // 中央は最低優先度
};

/**
 * 手の優先順位を比較する関数
 * @param a 比較する手A
 * @param b 比較する手B
 * @param previousBest 前回の最善手（オプション）
 * @returns -1 if a > b, 1 if b > a, 0 if equal priority
 */
export const compareMovesByPriority = (
  a: Position,
  b: Position,
  previousBest?: Position
): number => {
  // 前回の最善手がある場合は最優先
  if (previousBest) {
    const isAPreviousBest = a.row === previousBest.row && a.col === previousBest.col;
    const isBPreviousBest = b.row === previousBest.row && b.col === previousBest.col;

    if (isAPreviousBest && !isBPreviousBest) return -1;
    if (!isAPreviousBest && isBPreviousBest) return 1;
  }

  // 位置の優先度で比較
  const priorityA = getMovePositionPriority(a);
  const priorityB = getMovePositionPriority(b);

  if (priorityA > priorityB) return -1;
  if (priorityA < priorityB) return 1;
  return 0;
};
