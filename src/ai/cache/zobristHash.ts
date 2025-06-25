import type { Board } from '../../game/types';

// Zobrist Hashingのためのランダム値テーブル
// 各マス×各色（黒、白）に対して64ビット相当の値を持つ
class ZobristTable {
  private readonly blackTable: bigint[][];
  private readonly whiteTable: bigint[][];
  private readonly blackToMove: bigint;

  constructor() {
    // 疑似乱数生成器（再現性のため固定シード）
    const random = this.createRandom(12345);

    // 8x8の盤面に対して各色のランダム値を生成
    this.blackTable = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null).map(() => this.randomBigInt(random)));
    
    this.whiteTable = Array(8)
      .fill(null)
      .map(() => Array(8).fill(null).map(() => this.randomBigInt(random)));

    // 手番用のランダム値
    this.blackToMove = this.randomBigInt(random);
  }

  private createRandom(seed: number) {
    // 単純な線形合同法による疑似乱数生成器
    let state = seed;
    return () => {
      state = (state * 1103515245 + 12345) >>> 0;
      return state / 0x100000000;
    };
  }

  private randomBigInt(random: () => number): bigint {
    // 64ビット相当のランダム値を生成
    const high = Math.floor(random() * 0x100000000);
    const low = Math.floor(random() * 0x100000000);
    return (BigInt(high) << 32n) | BigInt(low);
  }

  getBlackValue(row: number, col: number): bigint {
    return this.blackTable[row][col];
  }

  getWhiteValue(row: number, col: number): bigint {
    return this.whiteTable[row][col];
  }

  getBlackToMoveValue(): bigint {
    return this.blackToMove;
  }
}

// シングルトンインスタンス
const zobristTable = new ZobristTable();

/**
 * 盤面のZobristハッシュを計算
 * @param board 盤面
 * @param currentPlayer 現在の手番（オプション）
 * @returns ハッシュ値（文字列）
 */
export function computeBoardHash(board: Board, currentPlayer?: 'black' | 'white'): string {
  let hash = 0n;

  // 各マスの駒に対応するハッシュ値をXOR
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col];
      if (piece === 'black') {
        hash ^= zobristTable.getBlackValue(row, col);
      } else if (piece === 'white') {
        hash ^= zobristTable.getWhiteValue(row, col);
      }
    }
  }

  // 手番も含める場合
  if (currentPlayer === 'black') {
    hash ^= zobristTable.getBlackToMoveValue();
  }

  // BigIntを文字列に変換（キーとして使用するため）
  return hash.toString(16);
}

/**
 * 盤面と手番を組み合わせたキーを生成
 */
export function getBoardStateKey(board: Board, player: 'black' | 'white'): string {
  const boardHash = computeBoardHash(board);
  return `${boardHash}-${player}`;
}