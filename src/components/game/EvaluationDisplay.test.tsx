import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvaluationDisplay } from './EvaluationDisplay';

describe('EvaluationDisplay', () => {
  it('黒と白の評価値を表示する', () => {
    render(
      <EvaluationDisplay board={[]} evaluation={20} currentPlayer="black" playerColor="black" />
    );

    // 正規化されたスコア（黒有利の場合）
    // evaluation=20は、黒55、白45程度になる
    expect(screen.getByText('55.0')).toBeInTheDocument();
    expect(screen.getByText('45.0')).toBeInTheDocument();
  });

  it('評価値の差に応じて適切な優劣テキストを表示', () => {
    const { rerender } = render(
      <EvaluationDisplay board={[]} evaluation={0} currentPlayer="black" playerColor="black" />
    );

    expect(screen.getByText('互角')).toBeInTheDocument();

    rerender(
      <EvaluationDisplay board={[]} evaluation={30} currentPlayer="black" playerColor="black" />
    );

    expect(screen.getByText('白やや有利')).toBeInTheDocument();

    rerender(
      <EvaluationDisplay board={[]} evaluation={-80} currentPlayer="black" playerColor="black" />
    );

    expect(screen.getByText('黒優勢')).toBeInTheDocument();
  });

  it('プレイヤーとAIのスコアを正しく表示', () => {
    render(
      <EvaluationDisplay board={[]} evaluation={20} currentPlayer="white" playerColor="white" />
    );

    const playerElements = screen.getAllByText('あなた');
    const aiElements = screen.getAllByText('AI');

    const playerScore = playerElements[0].parentElement;
    const aiScore = aiElements[0].parentElement;

    expect(playerScore).toHaveTextContent('55.0'); // プレイヤーは白（正規化後）
    expect(aiScore).toHaveTextContent('45.0'); // AIは黒（正規化後）
  });

  it('現在のプレイヤーをアクティブ表示', () => {
    render(
      <EvaluationDisplay board={[]} evaluation={20} currentPlayer="black" playerColor="black" />
    );

    const playerElements = screen.getAllByText('あなた');
    const playerElement = playerElements[0].parentElement;
    expect(playerElement).toHaveClass('active');
  });

  it('ヘルプボタンが存在する', () => {
    render(
      <EvaluationDisplay board={[]} evaluation={20} currentPlayer="black" playerColor="black" />
    );

    const helpButton = screen.getByRole('button', { name: '?' });
    expect(helpButton).toHaveAttribute(
      'title',
      '評価値は盤面の有利さを数値化したものです。50が均衡状態で、100に近いほど有利、0に近いほど不利を示します。'
    );
  });
});
