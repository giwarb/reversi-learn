import { type FC, useEffect, useState } from 'react';
import { UI_CONSTANTS } from '../../constants/ai';
import './AILevelNotification.css';

interface AILevelNotificationProps {
  level: number;
}

export const AILevelNotification: FC<AILevelNotificationProps> = ({ level }) => {
  const [show, setShow] = useState(false);
  const [prevLevel, setPrevLevel] = useState(level);

  useEffect(() => {
    if (level !== prevLevel) {
      setShow(true);
      setPrevLevel(level);
      const timer = setTimeout(() => {
        setShow(false);
      }, UI_CONSTANTS.NOTIFICATION_DURATION_MS);
      return () => clearTimeout(timer);
    }
  }, [level, prevLevel]);

  const getLevelDescription = (level: number) => {
    if (level <= UI_CONSTANTS.EASY_LEVEL_THRESHOLD) return '弱い';
    if (level <= UI_CONSTANTS.MEDIUM_LEVEL_THRESHOLD) return '普通';
    return '強い';
  };

  if (!show) return null;

  return (
    <div className="ai-level-notification">
      AIレベルを{level} ({getLevelDescription(level)})に変更しました
    </div>
  );
};
