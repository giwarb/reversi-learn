export const BOARD_SIZE = 8;

export const DIRECTIONS = [
  { row: -1, col: -1 }, // 左上
  { row: -1, col: 0 }, // 上
  { row: -1, col: 1 }, // 右上
  { row: 0, col: -1 }, // 左
  { row: 0, col: 1 }, // 右
  { row: 1, col: -1 }, // 左下
  { row: 1, col: 0 }, // 下
  { row: 1, col: 1 }, // 右下
] as const;
