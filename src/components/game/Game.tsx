import { type FC, useState } from 'react';
import type { Player } from '../../game/types';
import { useGameWithAI } from '../../hooks/useGameWithAI';
import { BadMoveDialog } from './BadMoveDialog';
import { Board } from './Board';
import { EvaluationDisplay } from './EvaluationDisplay';
import { GameControls } from './GameControls';
import { GameInfo } from './GameInfo';
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
    blackScore,
    whiteScore,
    isPassTurn,
  } = useGameWithAI(true);

  const [showAnalysis, setShowAnalysis] = useState(false);
  const [shouldShowBadMoveDialog, setShouldShowBadMoveDialog] = useState(false);
  const [showColorDialog, setShowColorDialog] = useState(false);

  const handleMove = (position: { row: number; col: number }) => {
    makeMove(position);
    // 悪手の場合は自動的にダイアログを表示
    setShouldShowBadMoveDialog(true);
  };

  const handleUndo = () => {
    undoLastMove();
    setShowAnalysis(false);
    setShouldShowBadMoveDialog(false);
  };

  const handleResetClick = () => {
    setShowColorDialog(true);
  };

  const handleColorSelect = (color: Player) => {
    resetGameWithColor(color);
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
      <GameInfo
        gameState={gameState}
        isAIThinking={isAIThinking}
        playerColor={playerColor}
        isPassTurn={isPassTurn}
      />
      <Board
        board={gameState.board}
        validMoves={validMoves}
        lastMove={lastMove}
        onCellClick={handleMove}
        isDisabled={isAIThinking || gameState.gameOver}
      />
      <EvaluationDisplay
        board={gameState.board}
        blackScore={blackScore}
        whiteScore={whiteScore}
        currentPlayer={gameState.currentPlayer}
        playerColor={playerColor}
      />
      <GameControls
        onReset={handleResetClick}
        aiLevel={aiLevel}
        onAILevelChange={setAILevel}
        isGameOver={gameState.gameOver}
      />
      <div className="game-actions">
        {canUndo && (
          <button type="button" onClick={handleUndo} className="undo-button">
            一手戻る
          </button>
        )}
        {lastMoveAnalysis && (
          <button type="button" onClick={() => setShowAnalysis(true)} className="analysis-button">
            最後の手を分析
          </button>
        )}
      </div>
      {((shouldShowBadMoveDialog && lastMoveAnalysis?.isBadMove) || showAnalysis) && boardBeforeLastMove && lastMoveAnalysis?.playerMove && (
        <BadMoveDialog
          analysis={lastMoveAnalysis}
          initialBoard={boardBeforeLastMove}
          playerMove={lastMoveAnalysis.playerMove}
          playerColor={playerColor}
          aiDepth={aiLevel}
          onClose={() => {
            setShowAnalysis(false);
            setShouldShowBadMoveDialog(false);
          }}
          onUndo={handleUndo}
        />
      )}
      <PlayerColorDialog isOpen={showColorDialog} onSelectColor={handleColorSelect} />
    </div>
  );
};
