import { type FC, useEffect, useState } from 'react';
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
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [level, prevLevel]);

  const getLevelDescription = (level: number) => {
    if (level <= 2) return '弱い';
    if (level <= 4) return '普通';
    return '強い';
  };

  if (!show) return null;

  return (
    <div className="ai-level-notification">
      AIレベルを{level} ({getLevelDescription(level)})に変更しました
    </div>
  );
};