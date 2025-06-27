import { type FC, useState } from 'react';
import { EVALUATION_CONSTANTS } from '../../constants/ai';
import type { Player } from '../../game/types';
import { useGameWithAI } from '../../hooks/useGameWithAI';
import { AILevelNotification } from './AILevelNotification';
import { BadMoveDialog } from './BadMoveDialog';
import { Board } from './Board';
import { EvaluationDisplay } from './EvaluationDisplay';
import { GameControls } from './GameControls';
import { GameInfo } from './GameInfo';
import { MoveRankingDisplay } from './MoveRankingDisplay';
import { PlayerColorDialog } from './PlayerColorDialog';
import './Game.css';

export const Game: FC = () => {
  const {
    gameState,
    isAIThinking,
    lastMoveAnalysis,
    validMoves,
    makeMove,
    resetGameWithColor,
    setAILevel,
    aiLevel,
    undoLastMove,
    canUndo,
    playerColor,
    rawEvaluation,
    isPassTurn,
    useIterativeDeepening,
    setUseIterativeDeepening,
    aiThinkingDepth,
    aiTimeLimit,
    setAITimeLimit,
  } = useGameWithAI(true);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);

  const handleMove = (position: { row: number; col: number }) => {
    makeMove(position);
  };

  const handleUndo = () => {
    undoLastMove();
    setShowAnalysis(false);
  };

  const handleResetClick = () => {
    setShowColorDialog(true);
  };

  const handleColorSelect = async (color: Player) => {
    await resetGameWithColor(color);
    setShowColorDialog(false);
  };

  const lastMove =
    gameState.moveHistory.length > 0
      ? gameState.moveHistory[gameState.moveHistory.length - 1]
      : null;

  // 最後の手を打つ前の盤面を取得
  const boardBeforeLastMove = (() => {
    if (gameState.fullMoveHistory.length === 0) return null;

    // プレイヤーが最後に打った手を探す
    let playerMoveIndex = gameState.fullMoveHistory.length - 1;

    // 最後のエントリがAIの手の場合、その前のプレイヤーの手を探す
    while (playerMoveIndex >= 0) {
      const entry = gameState.fullMoveHistory[playerMoveIndex];
      if (entry.player === playerColor && entry.type === 'move') {
        return entry.boardBefore;
      }
      playerMoveIndex--;
    }

    return null;
  })();

  return (
    <div className="game-container">
      <h1>リバーシ学習アプリ</h1>
      <div className="game-main-content">
        <div className="game-left-section">
          <GameInfo
            gameState={gameState}
            isAIThinking={isAIThinking}
            playerColor={playerColor}
            isPassTurn={isPassTurn}
            aiThinkingDepth={aiThinkingDepth}
            useIterativeDeepening={useIterativeDeepening}
          />
          <Board
            board={gameState.board}
            validMoves={validMoves}
            lastMove={lastMove}
            onCellClick={handleMove}
            isDisabled={isAIThinking || gameState.gameOver}
          />
          <GameControls
            onReset={handleResetClick}
            aiLevel={aiLevel}
            onAILevelChange={setAILevel}
            isGameOver={gameState.gameOver}
            useIterativeDeepening={useIterativeDeepening}
            onIterativeDeepeningChange={setUseIterativeDeepening}
            aiTimeLimit={aiTimeLimit}
            onAITimeLimitChange={setAITimeLimit}
          />
        </div>
        <div className="game-right-section">
          <EvaluationDisplay
            board={gameState.board}
            evaluation={rawEvaluation}
            currentPlayer={gameState.currentPlayer}
            playerColor={playerColor}
            searchDepth={aiLevel}
          />
          {lastMoveAnalysis && (
            <MoveRankingDisplay
              lastMoveAnalysis={lastMoveAnalysis}
              onShowAnalysis={() => setShowAnalysis(true)}
            />
          )}
        </div>
      </div>
      <div className="game-actions">
        {canUndo && (
          <button type="button" onClick={handleUndo} className="undo-button">
            一手戻る
          </button>
        )}
      </div>
      {showAnalysis && boardBeforeLastMove && lastMoveAnalysis?.playerMove && (
        <BadMoveDialog
          analysis={lastMoveAnalysis}
          initialBoard={boardBeforeLastMove}
          playerMove={lastMoveAnalysis.playerMove}
          playerColor={playerColor}
          depth={EVALUATION_CONSTANTS.EVALUATION_DEPTH}
          onClose={() => {
            setShowAnalysis(false);
          }}
          onUndo={handleUndo}
        />
      )}
      <PlayerColorDialog isOpen={showColorDialog} onSelectColor={handleColorSelect} />
      <AILevelNotification level={aiLevel} />
    </div>
  );
};
