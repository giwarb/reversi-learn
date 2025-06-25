import type { FC } from 'react';
import { countPieces } from '../../game/board';
import type { GameState, Player } from '../../game/types';

interface GameInfoProps {
  gameState: GameState;
  isAIThinking: boolean;
  playerColor?: Player;
  isPassTurn?: boolean;
  aiThinkingDepth?: number;
  useIterativeDeepening?: boolean;
}

export const GameInfo: FC<GameInfoProps> = ({
  gameState,
  isAIThinking,
  playerColor = 'black',
  isPassTurn = false,
  aiThinkingDepth = 0,
  useIterativeDeepening = false,
}) => {
  const counts = countPieces(gameState.board);

  const getPlayerText = () => {
    if (gameState.gameOver) {
      if (gameState.winner === 'draw') {
        return <span>引き分け</span>;
      }
      return <span>{gameState.winner === 'black' ? '黒' : '白'}の勝利！</span>;
    }

    if (isPassTurn) {
      return <span>{gameState.currentPlayer === 'black' ? '黒' : '白'}はパス</span>;
    }

    if (isAIThinking) {
      return (
        <span className="ai-thinking-container">
          AIが考えています
          {useIterativeDeepening && aiThinkingDepth > 0 && ` (深さ: ${aiThinkingDepth})`}
          <span className="spinner" />
        </span>
      );
    }

    return <span>{gameState.currentPlayer === 'black' ? '黒' : '白'}の番</span>;
  };

  return (
    <div className="game-info">
      <div className="current-player">
        {getPlayerText()}
        {!gameState.gameOver && <span className={`player-indicator ${gameState.currentPlayer}`} />}
      </div>
      <div className="score">
        <span>黒: {counts.black}</span>
        <span>白: {counts.white}</span>
      </div>
      <div className="player-info">
        <span>あなた: {playerColor === 'black' ? '黒' : '白'}</span>
        <span>AI: {playerColor === 'black' ? '白' : '黒'}</span>
      </div>
    </div>
  );
};
