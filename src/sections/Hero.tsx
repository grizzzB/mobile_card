import styles from './HeroRef.module.css';

export default function Hero() {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroImageFrame}>
        <img
          src="/assets/main.jpg"
          alt="wedding"
          className={styles.heroImage}
        />
      </div>
    </section>
  );
}
