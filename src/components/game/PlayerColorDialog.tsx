import type { FC } from 'react';
import type { Player } from '../../game/types';
import './PlayerColorDialog.css';

interface PlayerColorDialogProps {
  isOpen: boolean;
  onSelectColor: (color: Player) => void;
}

export const PlayerColorDialog: FC<PlayerColorDialogProps> = ({ isOpen, onSelectColor }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="dialog-overlay" />
      <div className="player-color-dialog">
        <h2>プレイヤーの色を選択</h2>
        <p>先手（黒）と後手（白）のどちらでプレイしますか？</p>
        <div className="color-buttons">
          <button
            type="button"
            className="color-button black"
            onClick={() => onSelectColor('black')}
          >
            <div className="stone-preview black-stone" />
            <span>先手（黒）</span>
            <small>あなたが最初に打ちます</small>
          </button>
          <button
            type="button"
            className="color-button white"
            onClick={() => onSelectColor('white')}
          >
            <div className="stone-preview white-stone" />
            <span>後手（白）</span>
            <small>AIが最初に打ちます</small>
          </button>
        </div>
      </div>
    </>
  );
};
