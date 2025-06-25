import { countPieces, createInitialBoard } from './board';
import { getAllValidMoves, getOpponent, getValidMove, makeMove } from './rules';
import type { GameState, Player, Position } from './types';

export const createInitialGameState = (): GameState => {
  return {
    board: createInitialBoard(),
    currentPlayer: 'black',
    gameOver: false,
    winner: null,
    moveHistory: [],
    fullMoveHistory: [],
  };
};

export const checkGameOver = (state: GameState): GameState => {
  const blackMoves = getAllValidMoves(state.board, 'black');
  const whiteMoves = getAllValidMoves(state.board, 'white');

  if (blackMoves.length === 0 && whiteMoves.length === 0) {
    const counts = countPieces(state.board);
    let winner: Player | 'draw' | null;

    if (counts.black > counts.white) {
      winner = 'black';
    } else if (counts.white > counts.black) {
      winner = 'white';
    } else {
      winner = 'draw';
    }

    return { ...state, gameOver: true, winner };
  }

  return state;
};

export const playMove = (state: GameState, position: Position): GameState | null => {
  if (state.gameOver) {
    return null;
  }

  const validMove = getValidMove(state.board, position, state.currentPlayer);
  if (!validMove) {
    return null;
  }

  const newBoard = makeMove(state.board, validMove, state.currentPlayer);
  const opponent = getOpponent(state.currentPlayer);
  const opponentMoves = getAllValidMoves(newBoard, opponent);

  let nextPlayer: Player;
  if (opponentMoves.length > 0) {
    nextPlayer = opponent;
  } else {
    const currentPlayerMoves = getAllValidMoves(newBoard, state.currentPlayer);
    if (currentPlayerMoves.length > 0) {
      nextPlayer = state.currentPlayer;
    } else {
      nextPlayer = state.currentPlayer;
    }
  }

  const newState: GameState = {
    board: newBoard,
    currentPlayer: nextPlayer,
    gameOver: false,
    winner: null,
    moveHistory: [...state.moveHistory, position],
    fullMoveHistory: [
      ...state.fullMoveHistory,
      {
        type: 'move',
        position,
        player: state.currentPlayer,
        boardBefore: state.board,
        boardAfter: newBoard,
      },
    ],
  };

  return checkGameOver(newState);
};

export const playPass = (state: GameState, player: Player): GameState => {
  const newState: GameState = {
    ...state,
    currentPlayer: getOpponent(player),
    fullMoveHistory: [
      ...state.fullMoveHistory,
      {
        type: 'pass',
        player,
        boardBefore: state.board,
        boardAfter: state.board,
      },
    ],
  };

  return newState;
};
