import { useScrollFade } from '../hooks/useScrollFade';
import styles from './Ending.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';

export default function Ending() {
  const ref = useScrollFade();
  const { bride, groom } = WEDDING_CONFIG;

  const handleKakaoShare = () => {
    // KakaoTalk sharing — requires Kakao SDK initialization
    // For now, fall back to native share or copy link
    if (navigator.share) {
      navigator.share({
        title: `${bride.self.name} ♥ ${groom.self.name} 결혼합니다`,
        text: '저희 두 사람의 결혼식에 초대합니다.',
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('링크가 복사되었습니다.');
    }
  };

  return (
    <section ref={ref} className={styles.endingSection}>
      <div className={styles.container}>
        <div className={styles.poem}>
          <p className={styles.poemText}>
            {"\"For small creatures such as we, the vastness is only bearable through love.\""}
            <br />
            {"\"우리처럼 작은 존재들에게, 우주의 광대함을 견디는 방법은 오직 사랑뿐입니다.\""}
          </p>
          <p className={styles.poemSource}>칼 세이건, 『코스모스』</p>
        </div>

        <button className={styles.shareBtn} onClick={handleKakaoShare}>
          <img src="/assets/kakaoTalk.svg" alt="" className={styles.shareBtnIcon} />
          카카오톡으로 초대장 보내기
        </button>

        <p className={styles.copyright}>
          Copyright ⓒ 2026. RETEMETER LLC. All rights reserved.
        </p>
      </div>
    </section>
  );
}
