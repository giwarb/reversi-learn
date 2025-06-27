import type { FC } from 'react';
import type { Player, Position } from '../../game/types';
import { positionToAlgebraic } from '../../utils/boardUtils';
import { getNormalizedScores } from '../../utils/evaluationNormalizer';

interface MoveWithScore {
  position: Position;
  score: number;
}

interface MoveListProps {
  moves: MoveWithScore[];
  playerMove: Position;
  playerColor: Player;
}

export const MoveList: FC<MoveListProps> = ({ moves, playerMove, playerColor }) => {
  if (!moves || moves.length === 0) {
    return null;
  }

  return (
    <div className="all-moves-section">
      <h3>全ての合法手と評価値</h3>
      <div className="moves-list">
        {moves.map((move, index) => {
          const isPlayerMove =
            move.position.row === playerMove.row && move.position.col === playerMove.col;
          const isBestMove = index === 0;
          const isBadMove = index >= moves.length * 0.8;

          const normalizedScores = getNormalizedScores(move.score);
          const playerNormalizedScore =
            playerColor === 'black' ? normalizedScores.blackScore : normalizedScores.whiteScore;
          const aiNormalizedScore =
            playerColor === 'black' ? normalizedScores.whiteScore : normalizedScores.blackScore;

          return (
            <div
              key={`${move.position.row}-${move.position.col}`}
              className={`move-item ${isPlayerMove ? 'player-move' : ''} ${isBestMove && !isPlayerMove ? 'best-move' : ''} ${isBadMove && !isPlayerMove && !isBestMove ? 'bad-move' : ''}`}
            >
              <span className="move-rank">#{index + 1}</span>
              <span className="move-position">{positionToAlgebraic(move.position)}</span>
              <span className="move-evaluation">
                {isPlayerMove && '(あなたの手)'}
                {isBestMove && !isPlayerMove && '(最善手)'}
              </span>
              <span className="move-score">
                {playerNormalizedScore.toFixed(1)} vs {aiNormalizedScore.toFixed(1)}
                <span style={{ marginLeft: '8px', color: '#666' }}>
                  ({move.score > 0 ? '+' : ''}
                  {move.score.toFixed(0)}点)
                </span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
