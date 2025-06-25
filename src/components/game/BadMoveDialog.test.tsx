import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createInitialBoard } from '../../game/board';
import { makeMove, getValidMove } from '../../game/rules';
import type { Board } from '../../game/types';
import { BadMoveDialog } from './BadMoveDialog';
import type { BadMoveResult } from '../../game/badMoveDetector';
import type { DetailedBadMoveAnalysis } from '../../ai/badMoveAnalyzer';

describe('BadMoveDialog - ストーリーテスト', () => {
  it('c4 -> c3 -> c2の悪手シナリオで5つの盤面が正しく表示される', () => {
    // 初期盤面から c4 -> c3 まで進めた状態を作成
    let board = createInitialBoard();
    
    // c4 (3,2) - 黒の手 (row=4-1=3, col=c-a=2)
    const c4Move = getValidMove(board, { row: 3, col: 2 }, 'black');
    if (c4Move) board = makeMove(board, c4Move, 'black');
    
    // c3 (2,2) - 白の手 (row=3-1=2, col=c-a=2)
    const c3Move = getValidMove(board, { row: 2, col: 2 }, 'white');
    if (c3Move) board = makeMove(board, c3Move, 'white');
    
    // この時点が「手を打つ前の盤面」
    const initialBoard = JSON.parse(JSON.stringify(board)) as Board;
    
    // c2 (1,2) - 黒の手（悪手）(row=2-1=1, col=c-a=2)
    const playerMove = { row: 1, col: 2 };
    
    // 詳細な分析データ
    const detailedAnalysis: DetailedBadMoveAnalysis = {
      playerMove: { row: 1, col: 2 }, // c2
      bestMove: { row: 4, col: 5 }, // e6
      scoreDifference: -200,
      impacts: [],
      opponentBestResponse: { row: 4, col: 2 }, // c5 (row=5-1=4, col=c-a=2)
      opponentBestResponseToRecommended: { row: 5, col: 3 }, // d6 (row=6-1=5, col=d-a=3)
      futureConsequences: [],
      evaluationAfterPlayerMove: -100,
      evaluationAfterOpponentResponse: -300,
      evaluationChangeFromOpponent: -200,
      bestMoveEvaluationAfterOpponent: 100,
      bestMoveEvaluationChange: 0,
    };
    
    // BadMoveResult
    const analysis: BadMoveResult = {
      isBadMove: true,
      playerMove: { row: 1, col: 2 }, // c2
      aiRecommendation: { row: 4, col: 5 }, // e6
      explanation: '悪手です',
      scoreDifference: -200,
      detailedAnalysis,
    };
    
    const { container } = render(
      <BadMoveDialog
        analysis={analysis}
        initialBoard={initialBoard}
        playerMove={playerMove}
        playerColor="black"
        aiDepth={5}
        onClose={() => {}}
      />
    );
    
    // 1. 手を打つ前の盤面が表示されている
    expect(screen.getByText('手を打つ前の盤面')).toBeInTheDocument();
    
    // 2. プレイヤーが打った直後の盤面（悪手のc2）
    const playerMoveSection = screen.getByText('あなたの手の結果').parentElement;
    expect(playerMoveSection).toBeInTheDocument();
    
    // 3. 相手の応手後の盤面（c5）
    const opponentResponseElements = screen.getAllByText(/相手の応手後/);
    expect(opponentResponseElements.length).toBeGreaterThanOrEqual(1);
    
    // 4. 推奨手を打った直後の盤面（e6）
    const recommendedMoveSection = screen.getByText('推奨手の結果').parentElement;
    expect(recommendedMoveSection).toBeInTheDocument();
    
    // 5. 推奨手に対する相手の応手後の盤面（d6）
    expect(opponentResponseElements.length).toBe(2); // 2つの「相手の応手後」セクション
    
    // 盤面要素の存在確認
    const boardGrids = container.querySelectorAll('.board-grid');
    expect(boardGrids.length).toBe(5); // 5つの盤面
    
    // ハイライトの確認
    const highlightedCells = container.querySelectorAll('.highlight-player-move, .highlight-ai-recommendation, .highlight-opponent-response');
    expect(highlightedCells.length).toBeGreaterThan(0);
    
    // 特定の手がハイライトされているか確認
    // c2 (row: 1, col: 2) がハイライトされている
    const c2Highlight = container.querySelector('.board-cell.highlight-player-move');
    expect(c2Highlight).toBeInTheDocument();
    
    // e6 (row: 4, col: 5) がハイライトされている
    const e6Highlight = container.querySelector('.board-cell.highlight-ai-recommendation');
    expect(e6Highlight).toBeInTheDocument();
    
    // 評価値表示の確認
    const evalScores = container.querySelectorAll('.eval-score');
    expect(evalScores.length).toBeGreaterThan(0);
  });
  
  it('各盤面が異なる状態を表示していることを確認', () => {
    // 初期盤面から c4 -> c3 まで進めた状態を作成
    let board = createInitialBoard();
    
    // c4 (3,2) - 黒の手 (row=4-1=3, col=c-a=2)
    const c4Move = getValidMove(board, { row: 3, col: 2 }, 'black');
    if (c4Move) board = makeMove(board, c4Move, 'black');
    
    // c3 (2,2) - 白の手 (row=3-1=2, col=c-a=2)
    const c3Move = getValidMove(board, { row: 2, col: 2 }, 'white');
    if (c3Move) board = makeMove(board, c3Move, 'white');
    
    const initialBoard = JSON.parse(JSON.stringify(board)) as Board;
    
    // c2 (1,2) - 黒の手（悪手）(row=2-1=1, col=c-a=2)
    const playerMove = { row: 1, col: 2 };
    
    const detailedAnalysis: DetailedBadMoveAnalysis = {
      playerMove: { row: 1, col: 2 },
      bestMove: { row: 4, col: 5 },
      scoreDifference: -200,
      impacts: [],
      opponentBestResponse: { row: 4, col: 2 },
      opponentBestResponseToRecommended: { row: 5, col: 3 },
      futureConsequences: [],
      evaluationAfterPlayerMove: -100,
      evaluationAfterOpponentResponse: -300,
      evaluationChangeFromOpponent: -200,
      bestMoveEvaluationAfterOpponent: 100,
      bestMoveEvaluationChange: 0,
    };
    
    const analysis: BadMoveResult = {
      isBadMove: true,
      playerMove: { row: 1, col: 2 },
      aiRecommendation: { row: 4, col: 5 },
      explanation: '悪手です',
      scoreDifference: -200,
      detailedAnalysis,
    };
    
    const { container } = render(
      <BadMoveDialog
        analysis={analysis}
        initialBoard={initialBoard}
        playerMove={playerMove}
        playerColor="black"
        aiDepth={5}
        onClose={() => {}}
      />
    );
    
    // 各盤面のグリッドを取得
    const boardGrids = container.querySelectorAll('.board-grid');
    
    // 盤面の石の数を数える関数
    const countStones = (boardGrid: Element) => {
      const blackStones = boardGrid.querySelectorAll('.stone.black').length;
      const whiteStones = boardGrid.querySelectorAll('.stone.white').length;
      return { black: blackStones, white: whiteStones };
    };
    
    // 各盤面の石の数を取得
    const boardCounts = Array.from(boardGrids).map(grid => countStones(grid));
    
    // 1. 手を打つ前の盤面（c4->c3後なので黒3、白3）
    expect(boardCounts[0]).toEqual({ black: 3, white: 3 });
    
    // 2. プレイヤーが打った直後（c2、黒5、白2）
    expect(boardCounts[1]).toEqual({ black: 5, white: 2 });
    
    // 3. 相手の応手後（c5、黒4、白4）
    expect(boardCounts[2]).toEqual({ black: 4, white: 4 });
    
    // 4. 推奨手を打った直後（e6、黒5、白2）
    expect(boardCounts[3]).toEqual({ black: 5, white: 2 });
    
    // 5. 推奨手に対する相手の応手後（動的に計算される）
    // 最善手が動的に計算されるため、石の数は固定ではない
    expect(boardCounts[4]).toBeDefined();
    expect(boardCounts[4].black + boardCounts[4].white).toBeGreaterThan(0);
    
    // 石の位置が異なることを確認（同じ石数でも配置が違う）
    const getStonePositions = (boardGrid: Element) => {
      const positions: string[] = [];
      boardGrid.querySelectorAll('.board-row').forEach((row, rowIndex) => {
        row.querySelectorAll('.board-cell').forEach((cell, colIndex) => {
          const stone = cell.querySelector('.stone');
          if (stone) {
            positions.push(`${rowIndex},${colIndex}:${stone.classList.contains('black') ? 'B' : 'W'}`);
          }
        });
      });
      return positions.sort().join('|');
    };
    
    const boardPositions = Array.from(boardGrids).map(grid => getStonePositions(grid));
    
    // 各盤面が異なる配置であることを確認
    expect(boardPositions[0]).not.toBe(boardPositions[1]); // 手を打つ前 != プレイヤーの手後
    expect(boardPositions[1]).not.toBe(boardPositions[2]); // プレイヤーの手後 != 相手応手後
    expect(boardPositions[3]).not.toBe(boardPositions[1]); // 推奨手後 != プレイヤーの手後
    expect(boardPositions[4]).not.toBe(boardPositions[2]); // 推奨手→相手応手後 != プレイヤー→相手応手後
  });
});