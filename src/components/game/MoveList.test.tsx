import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Player, Position } from '../../game/types';
import { MoveList } from './MoveList';

describe('MoveList', () => {
  const mockMoves = [
    { position: { row: 2, col: 3 }, score: 100 },
    { position: { row: 5, col: 6 }, score: 50 },
    { position: { row: 1, col: 2 }, score: -20 },
  ];

  const playerMove: Position = { row: 5, col: 6 };
  const playerColor: Player = 'black';

  it('renders all moves with rankings', () => {
    render(<MoveList moves={mockMoves} playerMove={playerMove} playerColor={playerColor} />);

    expect(screen.getByText('全ての合法手と評価値')).toBeInTheDocument();
    expect(screen.getByText('#1')).toBeInTheDocument();
    expect(screen.getByText('#2')).toBeInTheDocument();
    expect(screen.getByText('#3')).toBeInTheDocument();
  });

  it('highlights player move', () => {
    render(<MoveList moves={mockMoves} playerMove={playerMove} playerColor={playerColor} />);

    expect(screen.getByText('(あなたの手)')).toBeInTheDocument();
  });

  it('shows best move indicator', () => {
    render(<MoveList moves={mockMoves} playerMove={playerMove} playerColor={playerColor} />);

    expect(screen.getByText('(最善手)')).toBeInTheDocument();
  });

  it('displays move positions correctly', () => {
    render(<MoveList moves={mockMoves} playerMove={playerMove} playerColor={playerColor} />);

    expect(screen.getByText('d3')).toBeInTheDocument();
    expect(screen.getByText('g6')).toBeInTheDocument();
    expect(screen.getByText('c2')).toBeInTheDocument();
  });
});
