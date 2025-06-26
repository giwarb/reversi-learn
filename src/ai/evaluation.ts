import { countPieces } from '../game/board';
import { BOARD_SIZE } from '../game/constants';
import { getAllValidMoves } from '../game/rules';
import type { Board, Player } from '../game/types';

/**
 * Count stable discs (stones that cannot be flipped)
 * Stable discs include:
 * - Corner stones
 * - Stones connected to corners along edges
 * - Stones in completely filled rows/columns
 */
const countStableDiscs = (board: Board, player: Player): number => {
  let stableCount = 0;
  const stable: boolean[][] = Array(BOARD_SIZE)
    .fill(null)
    .map(() => Array(BOARD_SIZE).fill(false));

  // Corner stones are always stable
  const corners = [
    { row: 0, col: 0 },
    { row: 0, col: BOARD_SIZE - 1 },
    { row: BOARD_SIZE - 1, col: 0 },
    { row: BOARD_SIZE - 1, col: BOARD_SIZE - 1 },
  ];

  for (const corner of corners) {
    if (board[corner.row][corner.col] === player) {
      stable[corner.row][corner.col] = true;
      stableCount++;
    }
  }

  // Check for stable stones connected to corners along edges
  // From top-left corner
  if (stable[0][0]) {
    // Top edge
    for (let col = 1; col < BOARD_SIZE; col++) {
      if (board[0][col] === player && stable[0][col - 1]) {
        stable[0][col] = true;
        stableCount++;
      } else {
        break;
      }
    }
    // Left edge
    for (let row = 1; row < BOARD_SIZE; row++) {
      if (board[row][0] === player && stable[row - 1][0]) {
        stable[row][0] = true;
        stableCount++;
      } else {
        break;
      }
    }
  }

  // From top-right corner
  if (stable[0][BOARD_SIZE - 1]) {
    // Top edge
    for (let col = BOARD_SIZE - 2; col >= 0; col--) {
      if (board[0][col] === player && stable[0][col + 1]) {
        stable[0][col] = true;
        stableCount++;
      } else {
        break;
      }
    }
    // Right edge
    for (let row = 1; row < BOARD_SIZE; row++) {
      if (board[row][BOARD_SIZE - 1] === player && stable[row - 1][BOARD_SIZE - 1]) {
        stable[row][BOARD_SIZE - 1] = true;
        stableCount++;
      } else {
        break;
      }
    }
  }

  // From bottom-left corner
  if (stable[BOARD_SIZE - 1][0]) {
    // Bottom edge
    for (let col = 1; col < BOARD_SIZE; col++) {
      if (board[BOARD_SIZE - 1][col] === player && stable[BOARD_SIZE - 1][col - 1]) {
        stable[BOARD_SIZE - 1][col] = true;
        stableCount++;
      } else {
        break;
      }
    }
    // Left edge
    for (let row = BOARD_SIZE - 2; row >= 0; row--) {
      if (board[row][0] === player && stable[row + 1][0]) {
        stable[row][0] = true;
        stableCount++;
      } else {
        break;
      }
    }
  }

  // From bottom-right corner
  if (stable[BOARD_SIZE - 1][BOARD_SIZE - 1]) {
    // Bottom edge
    for (let col = BOARD_SIZE - 2; col >= 0; col--) {
      if (board[BOARD_SIZE - 1][col] === player && stable[BOARD_SIZE - 1][col + 1]) {
        stable[BOARD_SIZE - 1][col] = true;
        stableCount++;
      } else {
        break;
      }
    }
    // Right edge
    for (let row = BOARD_SIZE - 2; row >= 0; row--) {
      if (board[row][BOARD_SIZE - 1] === player && stable[row + 1][BOARD_SIZE - 1]) {
        stable[row][BOARD_SIZE - 1] = true;
        stableCount++;
      } else {
        break;
      }
    }
  }

  // Check for completely filled rows
  for (let row = 0; row < BOARD_SIZE; row++) {
    let allFilled = true;
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!board[row][col]) {
        allFilled = false;
        break;
      }
    }
    if (allFilled) {
      for (let col = 0; col < BOARD_SIZE; col++) {
        if (board[row][col] === player && !stable[row][col]) {
          stable[row][col] = true;
          stableCount++;
        }
      }
    }
  }

  // Check for completely filled columns
  for (let col = 0; col < BOARD_SIZE; col++) {
    let allFilled = true;
    for (let row = 0; row < BOARD_SIZE; row++) {
      if (!board[row][col]) {
        allFilled = false;
        break;
      }
    }
    if (allFilled) {
      for (let row = 0; row < BOARD_SIZE; row++) {
        if (board[row][col] === player && !stable[row][col]) {
          stable[row][col] = true;
          stableCount++;
        }
      }
    }
  }

  return stableCount;
};

/**
 * Count potential mobility (empty squares adjacent to opponent stones)
 * This represents future move possibilities
 */
const evaluatePotentialMobility = (board: Board, player: Player): number => {
  const opponent = player === 'black' ? 'white' : 'black';
  const potentialSquares = new Set<string>();

  for (let row = 0; row < BOARD_SIZE; row++) {
    for (let col = 0; col < BOARD_SIZE; col++) {
      if (!board[row][col]) {
        const directions = [
          [-1, -1],
          [-1, 0],
          [-1, 1],
          [0, -1],
          [0, 1],
          [1, -1],
          [1, 0],
          [1, 1],
        ];

        for (const [dr, dc] of directions) {
          const newRow = row + dr;
          const newCol = col + dc;
          if (
            newRow >= 0 &&
            newRow < BOARD_SIZE &&
            newCol >= 0 &&
            newCol < BOARD_SIZE &&
            board[newRow][newCol] === opponent
          ) {
            potentialSquares.add(`${row},${col}`);
            break;
          }
        }
      }
    }
  }

  return potentialSquares.size;
};

/**
 * Evaluate stable discs
 * Returns negative for black advantage, positive for white advantage
 */
export const evaluateStableDiscs = (board: Board): number => {
  const blackStable = countStableDiscs(board, 'black');
  const whiteStable = countStableDiscs(board, 'white');

  if (blackStable + whiteStable === 0) {
    return 0;
  }

  return (100 * (whiteStable - blackStable)) / (blackStable + whiteStable);
};

/**
 * Evaluate mobility (number of valid moves)
 * Returns negative for black advantage, positive for white advantage
 */
export const evaluateMobility = (board: Board): number => {
  const blackMoves = getAllValidMoves(board, 'black');
  const whiteMoves = getAllValidMoves(board, 'white');

  if (blackMoves.length + whiteMoves.length !== 0) {
    return (
      (100 * (whiteMoves.length - blackMoves.length)) / (blackMoves.length + whiteMoves.length)
    );
  }

  return 0;
};

/**
 * Evaluate potential mobility
 * Returns negative for black advantage, positive for white advantage
 */
export const evaluatePotentialMobilityScore = (board: Board): number => {
  const blackPotential = evaluatePotentialMobility(board, 'black');
  const whitePotential = evaluatePotentialMobility(board, 'white');

  if (blackPotential + whitePotential === 0) {
    return 0;
  }

  return (100 * (whitePotential - blackPotential)) / (blackPotential + whitePotential);
};

/**
 * Evaluate piece count
 * Returns negative for black advantage, positive for white advantage
 */
export const evaluatePieceCount = (board: Board): number => {
  const counts = countPieces(board);

  if (counts.black + counts.white !== 0) {
    return (100 * (counts.white - counts.black)) / (counts.black + counts.white);
  }

  return 0;
};

/**
 * Comprehensive board evaluation
 * Weights different factors based on game phase
 * Returns negative for black advantage, positive for white advantage
 */
export const evaluateBoard = (board: Board): number => {
  const counts = countPieces(board);
  const totalPieces = counts.black + counts.white;

  if (totalPieces < 20) {
    // Early game: Prioritize mobility and potential mobility
    return (
      evaluateMobility(board) * 5 +
      evaluatePotentialMobilityScore(board) * 2 +
      evaluateStableDiscs(board) * 1
    );
  } else if (totalPieces < 40) {
    // Mid game: Balanced evaluation with increased stable disc importance
    return (
      evaluateMobility(board) * 3 +
      evaluatePotentialMobilityScore(board) * 1 +
      evaluateStableDiscs(board) * 3 +
      evaluatePieceCount(board) * 0.5
    );
  } else {
    // End game: Prioritize stable discs and piece count
    return (
      evaluateMobility(board) * 1 + evaluateStableDiscs(board) * 5 + evaluatePieceCount(board) * 3
    );
  }
};

// Legacy compatibility
export const evaluatePosition = (_board: Board): number => {
  return 0;
};
