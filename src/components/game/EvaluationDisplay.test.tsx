import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { EvaluationDisplay } from './EvaluationDisplay';

describe('EvaluationDisplay', () => {
  it('黒と白の評価値を表示する', () => {
    render(
      <EvaluationDisplay
        board={[]}
        blackScore={20}
        whiteScore={0}
        currentPlayer="black"
        playerColor="black"
      />
    );

    // 正規化されたスコア（黒有利の場合）
    // blackScore=20, whiteScore=0の差20は、黒55、白45程度になる
    const blackScores = screen.getAllByText('55');
    const whiteScores = screen.getAllByText('45');
    expect(blackScores.length).toBeGreaterThan(0);
    expect(whiteScores.length).toBeGreaterThan(0);

    // 差分（絶対値）
    expect(screen.getByText('10')).toBeInTheDocument();
  });

  it('評価値の差に応じて適切な優劣テキストを表示', () => {
    const { rerender } = render(
      <EvaluationDisplay
        board={[]}
        blackScore={0}
        whiteScore={0}
        currentPlayer="black"
        playerColor="black"
      />
    );

    expect(screen.getByText('互角')).toBeInTheDocument();

    rerender(
      <EvaluationDisplay
        board={[]}
        blackScore={30}
        whiteScore={0}
        currentPlayer="black"
        playerColor="black"
      />
    );

    expect(screen.getByText('黒やや有利')).toBeInTheDocument();

    rerender(
      <EvaluationDisplay
        board={[]}
        blackScore={0}
        whiteScore={80}
        currentPlayer="black"
        playerColor="black"
      />
    );

    expect(screen.getByText('白優勢')).toBeInTheDocument();
  });

  it('プレイヤーとAIのスコアを正しく表示', () => {
    render(
      <EvaluationDisplay
        board={[]}
        blackScore={20}
        whiteScore={0}
        currentPlayer="white"
        playerColor="white"
      />
    );

    const playerScore = screen.getByText('あなた').parentElement;
    const aiScore = screen.getByText('AI').parentElement;

    expect(playerScore).toHaveTextContent('45'); // プレイヤーは白（正規化後）
    expect(aiScore).toHaveTextContent('55'); // AIは黒（正規化後）
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
      '評価値は盤面の有利さを数値化したものです。50が均衡状態で、100に近いほど有利、0に近いほど不利を示します。'
    );
  });
});
