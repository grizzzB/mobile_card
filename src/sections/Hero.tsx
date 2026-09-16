import styles from './HeroRef.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection} aria-label="청첩장 표지">
      <div className={styles.card}>
        <img
          src={`${import.meta.env.BASE_URL}assets/legacy/cover-custom-matched.webp`}
          alt="이도명과 변현진의 결혼식 초대장"
          width="1048"
          height="1501"
          fetchPriority="high"
          className={styles.frame}
        />
      </div>
      <p className={styles.scrollCue} aria-hidden="true">
        아래로 넘겨보세요
        <svg viewBox="0 0 24 24" focusable="false"><path d="M6 9l6 6 6-6" /></svg>
      </p>
    </section>
  );
}
