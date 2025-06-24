import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvaluationDisplay } from './EvaluationDisplay';

describe('EvaluationDisplay', () => {
  it('黒と白の評価値を表示する', () => {
    render(
      <EvaluationDisplay
        board={[]}
        blackScore={50}
        whiteScore={30}
        currentPlayer="black"
        playerColor="black"
      />
    );

    // 複数の要素があるため、より具体的に探す
    const scoreItems = screen.getAllByText('50');
    expect(scoreItems.length).toBeGreaterThan(0);
    
    const whiteScoreItems = screen.getAllByText('30');
    expect(whiteScoreItems.length).toBeGreaterThan(0);
    
    expect(screen.getByText('+20')).toBeInTheDocument(); // 差分
  });

  it('評価値の差に応じて適切な優劣テキストを表示', () => {
    const { rerender } = render(
      <EvaluationDisplay
        board={[]}
        blackScore={45}
        whiteScore={40}
        currentPlayer="black"
        playerColor="black"
      />
    );

    expect(screen.getByText('互角')).toBeInTheDocument();

    rerender(
      <EvaluationDisplay
        board={[]}
        blackScore={60}
        whiteScore={40}
        currentPlayer="black"
        playerColor="black"
      />
    );

    expect(screen.getByText('黒やや有利')).toBeInTheDocument();

    rerender(
      <EvaluationDisplay
        board={[]}
        blackScore={20}
        whiteScore={60}
        currentPlayer="black"
        playerColor="black"
      />
    );

    expect(screen.getByText('白有利')).toBeInTheDocument();
  });

  it('プレイヤーとAIのスコアを正しく表示', () => {
    render(
      <EvaluationDisplay
        board={[]}
        blackScore={50}
        whiteScore={30}
        currentPlayer="white"
        playerColor="white"
      />
    );

    const playerScore = screen.getByText('あなた').parentElement;
    const aiScore = screen.getByText('AI').parentElement;

    expect(playerScore).toHaveTextContent('30'); // プレイヤーは白
    expect(aiScore).toHaveTextContent('50'); // AIは黒
  });

  it('現在のプレイヤーをアクティブ表示', () => {
    render(
      <EvaluationDisplay
        board={[]}
        blackScore={50}
        whiteScore={30}
        currentPlayer="black"
        playerColor="black"
      />
    );

    const playerElement = screen.getByText('あなた').parentElement;
    expect(playerElement).toHaveClass('active');
  });

  it('ヘルプボタンが存在する', () => {
    render(
      <EvaluationDisplay
        board={[]}
        blackScore={50}
        whiteScore={30}
        currentPlayer="black"
        playerColor="black"
      />
    );

    const helpButton = screen.getByRole('button', { name: '?' });
    expect(helpButton).toHaveAttribute(
      'title',
      '評価値は盤面の有利さを数値化したものです。プラスは黒有利、マイナスは白有利を示します。'
    );
  });
});