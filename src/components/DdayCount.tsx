import React, { useEffect, useState } from 'react';
import styles from './DdayCount.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';

interface DdayCountProps {
  weddingDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

function calcTimeLeft(weddingDate: Date): TimeLeft {
  const now = new Date();
  const diff = weddingDate.getTime() - now.getTime();

  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: diff < 0 };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { days, hours, minutes, seconds, isPast: false };
}

const DdayCount: React.FC<DdayCountProps> = ({ weddingDate }) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calcTimeLeft(weddingDate));

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(weddingDate));
    }, 1000);
    return () => clearInterval(interval);
  }, [weddingDate]);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (timeLeft.isPast) {
    return (
      <div className={styles.ddayContainer}>
        <p className={styles.pastLabel}>결혼식이 거행되었습니다.</p>
      </div>
    );
  }

  return (
    <div className={styles.ddayContainer}>
      <p className={styles.ddayMessage}>
        {WEDDING_CONFIG.bride.self.name} · {WEDDING_CONFIG.groom.self.name}의 결혼식까지 남은 시간
      </p>
      <br />
      <div className={styles.countdown}>
        <div className={styles.unit}>
          <span className={styles.number}>{timeLeft.days}</span>
          <span className={styles.unitLabel}>일</span>
        </div>
        <span className={styles.sep}>:</span>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(timeLeft.hours)}</span>
          <span className={styles.unitLabel}>시간</span>
        </div>
        <span className={styles.sep}>:</span>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(timeLeft.minutes)}</span>
          <span className={styles.unitLabel}>분</span>
        </div>
        <span className={styles.sep}>:</span>
        <div className={styles.unit}>
          <span className={styles.number}>{pad(timeLeft.seconds)}</span>
          <span className={styles.unitLabel}>초</span>
        </div>
      </div>
    </div>
  );
};

export default DdayCount;
