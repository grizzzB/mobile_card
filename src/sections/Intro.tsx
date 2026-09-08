import styles from './Intro.module.css';

interface IntroProps {
  brideAndGroom: string;
  weddingDate: string;
  location?: string;
}

export default function Intro({ brideAndGroom, weddingDate, location }: IntroProps) {
  return (
    <section className={styles.introSection}>
      <div className={styles.content}>
        <h1 className={styles.title}>{brideAndGroom}</h1>
        <p className={styles.subtitle}>결혼합니다</p>

        <div className={styles.details}>
          <p className={styles.date}>{weddingDate}</p>
          {location && <p className={styles.location}>{location}</p>}
        </div>

        <div className={styles.decoration}>
          <span>✿</span>
        </div>
      </div>
    </section>
  );
};
