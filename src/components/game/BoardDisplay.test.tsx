import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { Board, Position } from '../../game/types';
import { BoardDisplay } from './BoardDisplay';

describe('BoardDisplay', () => {
  const mockBoard: Board = [
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, 'white', 'black', null, null, null],
    [null, null, null, 'black', 'white', null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
    [null, null, null, null, null, null, null, null],
  ];

  it('renders board with stones', () => {
    render(<BoardDisplay board={mockBoard} title="Test Board" highlights={[]} />);

    expect(screen.getByText('Test Board')).toBeInTheDocument();
    expect(screen.getAllByText('a')).toHaveLength(1);
    expect(screen.getAllByText('1')).toHaveLength(1);
  });

  it('applies highlights correctly', () => {
    const highlights: Position[] = [{ row: 3, col: 3 }];

    render(
      <BoardDisplay
        board={mockBoard}
        title="Test Board"
        highlights={highlights}
        highlightType="player-move"
      />
    );

    const boardGrid = screen.getByText('Test Board');
    expect(boardGrid).toBeInTheDocument();
  });

  it('shows column and row labels', () => {
    render(<BoardDisplay board={mockBoard} title="Test Board" highlights={[]} />);

    expect(screen.getByText('a')).toBeInTheDocument();
    expect(screen.getByText('h')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
  });
});
