import type { FC } from 'react';
import { countPieces } from '../../game/board';
import type { GameState } from '../../game/types';

interface GameInfoProps {
  gameState: GameState;
  isAIThinking: boolean;
}

export const GameInfo: FC<GameInfoProps> = ({ gameState, isAIThinking }) => {
  const counts = countPieces(gameState.board);

  const getPlayerText = () => {
    if (gameState.gameOver) {
      if (gameState.winner === 'draw') {
        return '引き分け';
      }
      return `${gameState.winner === 'black' ? '黒' : '白'}の勝利！`;
    }

    if (isAIThinking) {
      return 'AIが考えています...';
    }

    return `${gameState.currentPlayer === 'black' ? '黒' : '白'}の番`;
  };

  return (
    <div className="game-info">
      <div className="current-player">
        <span>{getPlayerText()}</span>
        {!gameState.gameOver && <span className={`player-indicator ${gameState.currentPlayer}`} />}
      </div>
      <div className="score">
        <span>黒: {counts.black}</span>
        <span>白: {counts.white}</span>
      </div>
    </div>
  );
};
