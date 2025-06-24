import { type FC, useState } from 'react';
import type { Player } from '../../game/types';
import { useGameWithAI } from '../../hooks/useGameWithAI';
import { BadMoveDialog } from './BadMoveDialog';
import { Board } from './Board';
import { GameControls } from './GameControls';
import { GameInfo } from './GameInfo';
import { PlayerColorDialog } from './PlayerColorDialog';

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
    playerColor,
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

  return (
    <div className="game-container">
      <h1>リバーシ学習アプリ</h1>
      <GameInfo gameState={gameState} isAIThinking={isAIThinking} playerColor={playerColor} />
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
      />
      {lastMoveAnalysis && (
        <button type="button" onClick={() => setShowAnalysis(true)}>
          最後の手を分析
        </button>
      )}
      {((shouldShowBadMoveDialog && lastMoveAnalysis?.isBadMove) || showAnalysis) && (
        <BadMoveDialog
          analysis={lastMoveAnalysis}
          board={gameState.board}
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
