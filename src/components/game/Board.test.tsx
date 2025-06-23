import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { createInitialBoard } from '../../game/board';
import { Board } from './Board';

describe('Board', () => {
  const mockOnCellClick = vi.fn();

  it('ボードを正しく表示する', () => {
    const board = createInitialBoard();
    render(<Board board={board} validMoves={[]} lastMove={null} onCellClick={mockOnCellClick} />);

    const cells = screen.getAllByRole('button');
    expect(cells).toHaveLength(64);
  });

  it('有効な手をクリックできる', async () => {
    const user = userEvent.setup();
    const board = createInitialBoard();
    const validMoves = [{ row: 2, col: 3 }];

    render(
      <Board board={board} validMoves={validMoves} lastMove={null} onCellClick={mockOnCellClick} />
    );

    const validCell = screen.getAllByRole('button')[2 * 8 + 3];
    await user.click(validCell);

    expect(mockOnCellClick).toHaveBeenCalledWith({ row: 2, col: 3 });
  });

  it('無効な手はクリックできない', () => {
    const board = createInitialBoard();
    const validMoves = [{ row: 2, col: 3 }];

    render(
      <Board board={board} validMoves={validMoves} lastMove={null} onCellClick={mockOnCellClick} />
    );

    const invalidCell = screen.getAllByRole('button')[0];
    expect(invalidCell).toBeDisabled();
  });

  it('最後の手をハイライトする', () => {
    const board = createInitialBoard();
    const lastMove = { row: 3, col: 3 };

    render(
      <Board board={board} validMoves={[]} lastMove={lastMove} onCellClick={mockOnCellClick} />
    );

    const lastMoveCell = screen.getAllByRole('button')[3 * 8 + 3];
    expect(lastMoveCell).toHaveClass('last-move');
  });
});
