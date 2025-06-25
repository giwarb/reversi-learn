import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { createInitialGameState } from '../../game/gameState';
import { GameInfo } from './GameInfo';

describe('GameInfo', () => {
  it('パスターンの時「パス」と表示される', () => {
    const gameState = createInitialGameState();

    render(
      <GameInfo gameState={gameState} isAIThinking={false} playerColor="black" isPassTurn={true} />
    );

    expect(screen.getByText('黒はパス')).toBeInTheDocument();
  });

  it('通常時は手番が表示される', () => {
    const gameState = createInitialGameState();

    render(
      <GameInfo gameState={gameState} isAIThinking={false} playerColor="black" isPassTurn={false} />
    );

    expect(screen.getByText('黒の番')).toBeInTheDocument();
  });

  it('AI思考中は「AIが考えています...」と表示される', () => {
    const gameState = createInitialGameState();

    render(
      <GameInfo gameState={gameState} isAIThinking={true} playerColor="black" isPassTurn={false} />
    );

    expect(screen.getByText('AIが考えています...')).toBeInTheDocument();
  });

  it('ゲーム終了時は勝者が表示される', () => {
    const gameState = {
      ...createInitialGameState(),
      gameOver: true,
      winner: 'black' as const,
    };

    render(<GameInfo gameState={gameState} isAIThinking={false} playerColor="black" />);

    expect(screen.getByText('黒の勝利！')).toBeInTheDocument();
  });

  it('引き分けの場合は「引き分け」と表示される', () => {
    const gameState = {
      ...createInitialGameState(),
      gameOver: true,
      winner: 'draw' as const,
    };

    render(<GameInfo gameState={gameState} isAIThinking={false} playerColor="black" />);

    expect(screen.getByText('引き分け')).toBeInTheDocument();
  });

  it('石の数が正しく表示される', () => {
    const gameState = createInitialGameState();

    render(<GameInfo gameState={gameState} isAIThinking={false} playerColor="black" />);

    expect(screen.getByText('黒: 2')).toBeInTheDocument();
    expect(screen.getByText('白: 2')).toBeInTheDocument();
  });

  it('プレイヤーとAIの色が正しく表示される', () => {
    const gameState = createInitialGameState();

    render(<GameInfo gameState={gameState} isAIThinking={false} playerColor="white" />);

    expect(screen.getByText('あなた: 白')).toBeInTheDocument();
    expect(screen.getByText('AI: 黒')).toBeInTheDocument();
  });
});
