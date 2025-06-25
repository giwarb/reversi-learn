import { useCallback, useEffect, useState } from 'react';
import { ReversiAI } from '../ai/ai';
import { evaluateBoard } from '../ai/evaluation';
import type { BadMoveResult } from '../game/badMoveDetector';
import { BadMoveDetector } from '../game/badMoveDetector';
import { countPieces } from '../game/board';
import { createInitialGameState, playMove, playPass } from '../game/gameState';
import { getAllValidMoves } from '../game/rules';
import type { GameState, Player, Position } from '../game/types';

export interface GameWithAIState {
  gameState: GameState;
  isAIThinking: boolean;
  lastMoveAnalysis: BadMoveResult | null;
  validMoves: Position[];
  makeMove: (position: Position) => void;
  resetGame: () => void;
  resetGameWithColor: (playerColor: Player) => void;
  setAILevel: (level: number) => void;
  aiLevel: number;
  undoLastMove: () => void;
  canUndo: boolean;
  playerColor: Player;
  blackScore: number;
  whiteScore: number;
  isPassTurn: boolean;
  beforeMoveBlackScore: number;
  beforeMoveWhiteScore: number;
}

export const useGameWithAI = (playAgainstAI: boolean = true): GameWithAIState => {
  const [gameState, setGameState] = useState<GameState>(createInitialGameState());
  const [isAIThinking, setIsAIThinking] = useState(false);
  const [lastMoveAnalysis, setLastMoveAnalysis] = useState<BadMoveResult | null>(null);
  const [aiLevel, setAILevel] = useState(4);
  const [ai] = useState(() => new ReversiAI({ maxDepth: aiLevel }));
  const [badMoveDetector] = useState(() => new BadMoveDetector(aiLevel));
  const [playerColor, setPlayerColor] = useState<Player>('black');
  const [isPassTurn, setIsPassTurn] = useState(false);
  const [beforeMoveBlackScore, setBeforeMoveBlackScore] = useState(0);
  const [beforeMoveWhiteScore, setBeforeMoveWhiteScore] = useState(0);

  const validMoves = getAllValidMoves(gameState.board, gameState.currentPlayer);

  // 現在の盤面の評価値を計算
  const blackScore = evaluateBoard(gameState.board, 'black');
  const whiteScore = evaluateBoard(gameState.board, 'white');

  const makeMove = useCallback(
    async (position: Position) => {
      if (isAIThinking || gameState.gameOver) return;

      const boardBeforeMove = gameState.board;
      const newState = playMove(gameState, position);

      if (!newState) return;

      // 悪手検出（人間のプレイヤーの手のみ）
      if (gameState.currentPlayer === playerColor) {
        // 手を打つ前の評価値を保存
        const beforeBlackScore = evaluateBoard(boardBeforeMove, 'black');
        const beforeWhiteScore = evaluateBoard(boardBeforeMove, 'white');
        setBeforeMoveBlackScore(beforeBlackScore);
        setBeforeMoveWhiteScore(beforeWhiteScore);

        const analysis = badMoveDetector.detectBadMove(
          boardBeforeMove,
          position,
          gameState.currentPlayer,
          playerColor
        );
        setLastMoveAnalysis(analysis);
      }

      setGameState(newState);
      setIsPassTurn(false); // パスターンをリセット

      // AIの手番
      const aiColor = playerColor === 'black' ? 'white' : 'black';
      if (playAgainstAI && newState.currentPlayer === aiColor && !newState.gameOver) {
        setIsAIThinking(true);

        // AIの思考を非同期で実行
        setTimeout(() => {
          const aiMove = ai.getMove(newState.board, aiColor);
          if (aiMove) {
            const aiNewState = playMove(newState, aiMove);
            if (aiNewState) {
              setGameState(aiNewState);
            }
          }
          setIsAIThinking(false);
        }, 500);
      }
    },
    [gameState, isAIThinking, playAgainstAI, ai, badMoveDetector, playerColor]
  );

  const resetGame = useCallback(() => {
    setGameState(createInitialGameState());
    setLastMoveAnalysis(null);
    setIsAIThinking(false);
    setIsPassTurn(false);
  }, []);

  const resetGameWithColor = useCallback(
    (newPlayerColor: Player) => {
      setPlayerColor(newPlayerColor);
      const initialState = createInitialGameState();
      setGameState(initialState);
      setLastMoveAnalysis(null);
      setIsAIThinking(false);
      setIsPassTurn(false);

      // 後手（白）を選んだ場合、AIに最初の一手を打たせる
      if (playAgainstAI && newPlayerColor === 'white') {
        setIsAIThinking(true);
        setTimeout(() => {
          const aiMove = ai.getMove(initialState.board, 'black');
          if (aiMove) {
            const newState = playMove(initialState, aiMove);
            if (newState) {
              setGameState(newState);
            }
          }
          setIsAIThinking(false);
        }, 500);
      }
    },
    [playAgainstAI, ai]
  );

  const undoLastMove = useCallback(() => {
    if (!gameState.fullMoveHistory.length || isAIThinking) return;

    // プレイヤーの最後の手まで戻る
    let targetIndex = gameState.fullMoveHistory.length - 1;

    // AIの手を戻す（プレイヤーの手まで戻る）
    while (targetIndex >= 0 && gameState.fullMoveHistory[targetIndex].player !== playerColor) {
      targetIndex--;
    }

    if (targetIndex < 0) return; // プレイヤーの手が見つからない場合

    // プレイヤーの手の前の状態に戻る
    targetIndex--;

    if (targetIndex < 0) {
      // 最初の状態に戻る
      const newState = createInitialGameState();
      setGameState(newState);
      setLastMoveAnalysis(null);
      setIsPassTurn(false);

      if (playerColor === 'white') {
        // プレイヤーが白の場合、AIの最初の手を打つ
        setIsAIThinking(true);
        setTimeout(() => {
          const aiMove = ai.getMove(newState.board, 'black');
          if (aiMove) {
            const aiState = playMove(newState, aiMove);
            if (aiState) {
              setGameState(aiState);
            }
          }
          setIsAIThinking(false);
        }, 500);
      }
    } else {
      // 指定されたインデックスの状態に戻る
      const targetEntry = gameState.fullMoveHistory[targetIndex];
      const newState = {
        ...gameState,
        board: targetEntry.boardAfter,
        currentPlayer: (targetEntry.player === 'black' ? 'white' : 'black') as Player,
        gameOver: false,
        winner: null,
        moveHistory: gameState.moveHistory.slice(
          0,
          gameState.fullMoveHistory
            .slice(0, targetIndex + 1)
            .filter((entry) => entry.type === 'move').length
        ),
        fullMoveHistory: gameState.fullMoveHistory.slice(0, targetIndex + 1),
      };
      setGameState(newState);
      setLastMoveAnalysis(null);
      setIsPassTurn(false);
    }
  }, [gameState, isAIThinking, playerColor, ai]);

  const handleSetAILevel = useCallback(
    (level: number) => {
      setAILevel(level);
      ai.setDepth(level);
      badMoveDetector.setAIDepth(level);
      // ゲーム中でもレベル変更を即座に反映（リセットしない）
    },
    [ai, badMoveDetector]
  );

  useEffect(() => {
    // パスの処理
    if (validMoves.length === 0 && !gameState.gameOver && !isAIThinking) {
      const opponent = gameState.currentPlayer === 'black' ? 'white' : 'black';
      const opponentMoves = getAllValidMoves(gameState.board, opponent);

      // 相手に有効な手がある場合のみ手番を切り替える
      if (opponentMoves.length > 0) {
        setIsPassTurn(true);

        // パス表示のための遅延
        setTimeout(() => {
          const newState = playPass(gameState, gameState.currentPlayer);
          setGameState(newState);
          setIsPassTurn(false);

          // パスの後、AIの手番になった場合
          const aiColor = playerColor === 'black' ? 'white' : 'black';
          if (playAgainstAI && opponent === aiColor) {
            setIsAIThinking(true);

            setTimeout(() => {
              const aiMove = ai.getMove(gameState.board, aiColor);
              if (aiMove) {
                const aiNewState = playMove(newState, aiMove);
                if (aiNewState) {
                  setGameState(aiNewState);
                }
              }
              setIsAIThinking(false);
            }, 500);
          }
        }, 1500); // パス表示を見せるため1.5秒待つ
      } else {
        // 両方とも打てない場合はゲーム終了
        const counts = countPieces(gameState.board);
        let winner: Player | 'draw' | null;

        if (counts.black > counts.white) {
          winner = 'black';
        } else if (counts.white > counts.black) {
          winner = 'white';
        } else {
          winner = 'draw';
        }

        setGameState({
          ...gameState,
          gameOver: true,
          winner,
        });
      }
    }
  }, [gameState, validMoves.length, playAgainstAI, playerColor, ai, isAIThinking]);

  return {
    gameState,
    isAIThinking,
    lastMoveAnalysis,
    validMoves,
    makeMove,
    resetGame,
    resetGameWithColor,
    setAILevel: handleSetAILevel,
    aiLevel,
    undoLastMove,
    canUndo:
      gameState.fullMoveHistory.some((entry) => entry.player === playerColor) && !isAIThinking,
    playerColor,
    blackScore,
    whiteScore,
    isPassTurn,
    beforeMoveBlackScore,
    beforeMoveWhiteScore,
  };
};
