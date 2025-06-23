import { type FC, useEffect } from 'react';
import type { BadMoveResult } from '../../game/badMoveDetector';
import './BadMoveDialog.css';

interface BadMoveDialogProps {
  analysis: BadMoveResult | null;
  onClose: () => void;
}

export const BadMoveDialog: FC<BadMoveDialogProps> = ({ analysis, onClose }) => {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!analysis) return null;

  const getDialogClass = () => {
    if (analysis.explanation.includes('最善手を選びました')) {
      return 'success';
    }
    if (analysis.isBadMove) {
      return 'error';
    }
    return 'warning';
  };

  const getTitle = () => {
    if (analysis.explanation.includes('最善手を選びました')) {
      return '素晴らしい！';
    }
    if (analysis.isBadMove) {
      return '悪手です';
    }
    return '手の分析';
  };

  return (
    <>
      <div
        className="dialog-overlay"
        onClick={onClose}
        onKeyDown={(e) => e.key === 'Escape' && onClose()}
        role="button"
        tabIndex={0}
        aria-label="Close dialog"
      />
      <div className={`bad-move-dialog ${getDialogClass()}`}>
        <div className="dialog-header">
          <h2>{getTitle()}</h2>
          <button type="button" className="close-button" onClick={onClose}>
            ×
          </button>
        </div>
        <div className="dialog-content">
          <pre>{analysis.explanation}</pre>
          {analysis.scoreDifference > 0 && (
            <p className="score-difference">評価値の差: {analysis.scoreDifference.toFixed(0)}点</p>
          )}
        </div>
      </div>
    </>
  );
};
