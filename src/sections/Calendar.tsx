import DdayCount from '../components/DdayCount';
import { useScrollFade } from '../hooks/useScrollFade';
import styles from './Calendar.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';

const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const MONTH_NAMES = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

function buildCalendarDays(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  return cells;
}

export default function Calendar() {
  const ref = useScrollFade();
  const { year, month, day, hour, minute, dayOfTheWeek } = WEDDING_CONFIG.weddingDate;

  const weddingDateObj = new Date(year, month - 1, day, hour, minute, 0);
  const cells = buildCalendarDays(year, month);

  const isPM = hour >= 12;
  const displayHour = hour > 12 ? hour - 12 : hour;

  return (
    <section ref={ref} className={styles.calendarSection}>
      <div className={styles.container}>
        <div className="section-header">
          <h2 className={styles.title}>SAVE THE DATE</h2>
          <p className={styles.subtitle}>
            {year}. {month}. {day}.
            <br />
            {dayOfTheWeek} {isPM ? '오후' : '오전'} {displayHour}시 {String(minute).padStart(2, '0')}분
          </p>
        </div>

        {/* Mini calendar */}
        <div className={styles.miniCalendar}>
          <p className={styles.calMonthLabel}>{year}년 {MONTH_NAMES[month - 1]}</p>
          <div className={styles.calGrid}>
            {DAY_NAMES.map((d) => (
              <span key={d} className={styles.calDayName}>{d}</span>
            ))}
            {cells.map((cell, i) => (
              <span
                key={i}
                className={[
                  styles.calCell,
                  cell === day ? styles.calToday : '',
                  cell !== null && new Date(year, month - 1, cell).getDay() === 0 ? styles.calSun : '',
                  cell !== null && new Date(year, month - 1, cell).getDay() === 6 ? styles.calSat : '',
                ].filter(Boolean).join(' ')}
              >
                {cell ?? ''}
              </span>
            ))}
          </div>
        </div>

        <DdayCount weddingDate={weddingDateObj} />
      </div>
    </section>
  );
}
