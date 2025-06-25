import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../../game/board';
import { makeMove, getValidMove, getAllValidMoves } from '../../game/rules';
import type { Board } from '../../game/types';

describe('BadMoveDialog - デバッグテスト', () => {
  it('e6後にd3が有効な手かを確認', () => {
    // 初期盤面から c4 -> c3 -> c2 まで進める
    let board = createInitialBoard();
    
    // c4 (3,2) - 黒の手
    const c4Move = getValidMove(board, { row: 3, col: 2 }, 'black');
    expect(c4Move).toBeTruthy();
    if (c4Move) board = makeMove(board, c4Move, 'black');
    
    // c3 (2,2) - 白の手
    const c3Move = getValidMove(board, { row: 2, col: 2 }, 'white');
    expect(c3Move).toBeTruthy();
    if (c3Move) board = makeMove(board, c3Move, 'white');
    
    // この時点で黒の手番
    
    // e6 (4,5) - 黒の推奨手
    const e6Move = getValidMove(board, { row: 4, col: 5 }, 'black');
    expect(e6Move).toBeTruthy();
    if (e6Move) board = makeMove(board, e6Move, 'black');
    
    // e6後の白の有効な手を全て取得
    const whiteValidMoves = getAllValidMoves(board, 'white');
    console.log('e6後の白の有効な手:', whiteValidMoves.map(m => ({
      row: m.row,
      col: m.col,
      notation: `${String.fromCharCode('a'.charCodeAt(0) + m.col)}${m.row + 1}`
    })));
    
    // d3 (2,3) が有効かチェック
    const d3Move = getValidMove(board, { row: 2, col: 3 }, 'white');
    expect(d3Move).toBeTruthy();
    
    // d3の有効性を詳しく確認
    const isD3Valid = whiteValidMoves.some(m => m.row === 2 && m.col === 3);
    expect(isD3Valid).toBe(true);
  });
  
  it('実際のボード状態をログ出力', () => {
    let board = createInitialBoard();
    
    // c4 -> c3
    const c4Move = getValidMove(board, { row: 3, col: 2 }, 'black');
    if (c4Move) board = makeMove(board, c4Move, 'black');
    const c3Move = getValidMove(board, { row: 2, col: 2 }, 'white');
    if (c3Move) board = makeMove(board, c3Move, 'white');
    
    console.log('c4->c3後のボード:');
    printBoard(board);
    
    // e6を打つ
    const e6Board = JSON.parse(JSON.stringify(board)) as Board;
    const e6Move = getValidMove(e6Board, { row: 4, col: 5 }, 'black');
    if (e6Move) {
      const afterE6 = makeMove(e6Board, e6Move, 'black');
      console.log('\ne6後のボード:');
      printBoard(afterE6);
      
      // 白の有効な手を確認
      const whiteMoves = getAllValidMoves(afterE6, 'white');
      console.log('\n白の有効な手:', whiteMoves.length, '個');
      whiteMoves.forEach(m => {
        console.log(`  ${String.fromCharCode('a'.charCodeAt(0) + m.col)}${m.row + 1} (row: ${m.row}, col: ${m.col})`);
      });
    }
    
    // c2を打つ 
    const c2Board = JSON.parse(JSON.stringify(board)) as Board;
    const c2Move = getValidMove(c2Board, { row: 1, col: 2 }, 'black');
    if (c2Move) {
      const afterC2 = makeMove(c2Board, c2Move, 'black');
      console.log('\nc2後のボード:');
      printBoard(afterC2);
      
      // 白の有効な手を確認
      const whiteMoves = getAllValidMoves(afterC2, 'white');
      console.log('\n白の有効な手:', whiteMoves.length, '個');
      whiteMoves.forEach(m => {
        console.log(`  ${String.fromCharCode('a'.charCodeAt(0) + m.col)}${m.row + 1} (row: ${m.row}, col: ${m.col})`);
      });
    }
  });
});

function printBoard(board: Board) {
  console.log('  a b c d e f g h');
  board.forEach((row, i) => {
    const rowStr = row.map(cell => 
      cell === 'black' ? '●' : cell === 'white' ? '○' : '·'
    ).join(' ');
    console.log(`${i + 1} ${rowStr}`);
  });
}