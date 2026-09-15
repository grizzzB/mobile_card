import { WEDDING_CONFIG, WEDDING_COVER } from '../utils/constants/weddingInfo';
import styles from './HeroRef.module.css';

export default function Hero() {
  const { weddingDate, groom, bride } = WEDDING_CONFIG;
  const date = new Date(weddingDate.year, weddingDate.month - 1, weddingDate.day);
  const dateLabel = date.toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const timeLabel = `${weddingDate.hour % 12 || 12}:${String(weddingDate.minute).padStart(2, '0')}${weddingDate.hour < 12 ? 'AM' : 'PM'}`;

  return (
    <section className={styles.heroSection} aria-label="청첩장 표지">
      <div className={styles.card}>
        <img
          src={`${import.meta.env.BASE_URL}assets/legacy/frame.webp`}
          alt=""
          width="1176"
          height="1176"
          fetchPriority="high"
          className={styles.frame}
        />
        <div className={styles.plate}>
          <img className={`${styles.line} ${styles.bouquet}`} src={`${import.meta.env.BASE_URL}assets/legacy/bouquet.webp`} alt="" width="90" height="111" />
          <p className={`${styles.line} ${styles.eyebrow}`}>Together with their families</p>
          <h1 className={styles.names} aria-label={`${groom.self.name} 그리고 ${bride.self.name} 결혼합니다`}>
            <span className={`${styles.line} ${styles.name1}`}>{WEDDING_COVER.groomName}</span>
            <span className={`${styles.line} ${styles.amp}`}>&amp;</span>
            <span className={`${styles.line} ${styles.name2}`}>{WEDDING_COVER.brideName}</span>
          </h1>
          <img className={`${styles.line} ${styles.divider}`} src={`${import.meta.env.BASE_URL}assets/legacy/divider.webp`} alt="" width="200" height="36" />
          <p className={`${styles.line} ${styles.invite}`}>Invite you to their wedding celebration</p>
          <p className={`${styles.line} ${styles.date}`}>{dateLabel}</p>
          <p className={`${styles.line} ${styles.time}`}>at {timeLabel}</p>
          <p className={`${styles.line} ${styles.venue1}`}>{WEDDING_COVER.venueLines[0]}</p>
          <p className={`${styles.line} ${styles.venue2}`}>{WEDDING_COVER.venueLines[1]}</p>
        </div>
      </div>
      <p className={styles.scrollCue} aria-hidden="true">
        아래로 넘겨보세요
        <svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
      </p>
    </section>
  );
}
