import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import type { BoardEvaluationExplanation } from '../../ai/boardEvaluationExplainer';
import { EvaluationSummary } from './EvaluationSummary';

describe('EvaluationSummary', () => {
  const mockExplanation: BoardEvaluationExplanation = {
    overallAssessment: 'テスト評価',
    mobility: {
      playerMoves: 5,
      opponentMoves: 3,
      advantage: 'player',
      playerPositions: [],
      opponentPositions: [],
    },
    opponentRestriction: {
      isRestricted: true,
      restrictedToXC: false,
      positions: [],
      xSquares: [],
      cSquares: [],
    },
    strongPositions: {
      corners: [],
      edges: [],
      stableDiscs: [],
      stableCount: {
        player: 5,
        opponent: 3,
      },
    },
    nextMoveStrength: {
      canTakeCorner: false,
      cornerPositions: [],
      canCreateStableEdge: false,
      edgePositions: [],
      canSeverelyLimitOpponent: false,
    },
    details: ['テスト詳細1', 'テスト詳細2'],
  };

  it('renders evaluation scores', () => {
    render(<EvaluationSummary playerScore={65.5} aiScore={34.5} explanation={mockExplanation} />);

    expect(screen.getByText(/あなた: 65.5/)).toBeInTheDocument();
    expect(screen.getByText(/AI: 34.5/)).toBeInTheDocument();
  });

  it('shows overall assessment', () => {
    render(<EvaluationSummary playerScore={65.5} aiScore={34.5} explanation={mockExplanation} />);

    expect(screen.getByText('テスト評価')).toBeInTheDocument();
  });

  it('displays board analysis section', () => {
    render(<EvaluationSummary playerScore={65.5} aiScore={34.5} explanation={mockExplanation} />);

    expect(screen.getByText('盤面分析')).toBeInTheDocument();
  });
});
