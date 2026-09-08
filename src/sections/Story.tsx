import React from 'react';
import { useScrollFade } from '../hooks/useScrollFade';
import styles from './Story.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';

const Story: React.FC = () => {
  const ref = useScrollFade();

  return (
    <section ref={ref} className={styles.interviewSection}>
      <div className={styles.container}>
        <div className="section-header">
          <h2 className={styles.title}>INVITATION</h2>
          <p className={styles.subtitle}>소중한 분들을 초대합니다</p>
        </div>

        <div className={styles.poem}>
          <p className={`${styles.poemText} ${styles.fadeItem}`} style={{ animationDelay: '0.15s' }}>
            {WEDDING_CONFIG.invitationText}
          </p>
        </div>

        <div className={`${styles.parents} ${styles.fadeItem}`} style={{ animationDelay: '0.4s' }}>
          <div className={styles.parentLine}>
            <span className={styles.parentNames}>{WEDDING_CONFIG.bride.father.name} · {WEDDING_CONFIG.bride.mother.name}</span>
            <span className={styles.parentRole}>의 딸</span>
            <span className={styles.personName}>{WEDDING_CONFIG.bride.self.name}</span>
          </div>
          <div className={styles.parentLine}>
            <span className={styles.parentNames}>{WEDDING_CONFIG.groom.father.name} · {WEDDING_CONFIG.groom.mother.name}</span>
            <span className={styles.parentRole}>의 아들</span>
            <span className={styles.personName}>{WEDDING_CONFIG.groom.self.name}</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Story;
