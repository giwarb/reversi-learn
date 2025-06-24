import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { GameControls } from './GameControls';

describe('GameControls', () => {
  const defaultProps = {
    onReset: vi.fn(),
    aiLevel: 4,
    onAILevelChange: vi.fn(),
    isGameOver: false,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('コントロールを正しくレンダリングする', () => {
    render(<GameControls {...defaultProps} />);

    expect(screen.getByText('新しいゲーム')).toBeInTheDocument();
    expect(screen.getByLabelText('AI レベル:')).toBeInTheDocument();
    expect(screen.getByRole('combobox')).toHaveValue('4');
  });

  it('新しいゲームボタンをクリックできる', () => {
    render(<GameControls {...defaultProps} />);

    fireEvent.click(screen.getByText('新しいゲーム'));
    expect(defaultProps.onReset).toHaveBeenCalledTimes(1);
  });

  it('AIレベルを変更できる', () => {
    render(<GameControls {...defaultProps} />);

    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '6' } });

    expect(defaultProps.onAILevelChange).toHaveBeenCalledWith(6);
  });

  it('ゲーム中でもAIレベルを変更できる', () => {
    render(<GameControls {...defaultProps} isGameOver={false} />);

    const select = screen.getByRole('combobox');
    expect(select).not.toBeDisabled();

    fireEvent.change(select, { target: { value: '2' } });
    expect(defaultProps.onAILevelChange).toHaveBeenCalledWith(2);
  });

  it('全てのAIレベルオプションが表示される', () => {
    render(<GameControls {...defaultProps} />);

    const select = screen.getByRole('combobox');
    const options = select.querySelectorAll('option');

    expect(options).toHaveLength(6);
    expect(options[0]).toHaveValue('1');
    expect(options[0]).toHaveTextContent('1 (弱い)');
    expect(options[3]).toHaveValue('4');
    expect(options[3]).toHaveTextContent('4 (普通)');
    expect(options[5]).toHaveValue('6');
    expect(options[5]).toHaveTextContent('6 (強い)');
  });
});
