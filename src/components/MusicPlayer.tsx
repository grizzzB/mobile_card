import { useEffect, useRef, useState } from 'react';
import styles from './MusicPlayer.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';

export default function MusicPlayer() {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [visible, setVisible] = useState(false);

    // Try to autoplay on mount; browsers may block it until user interaction
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        audio.volume = 0.5;
        audio.loop = true;

        const tryPlay = () => {
            audio.play().then(() => {
                setPlaying(true);
            }).catch(() => {
                // Autoplay blocked — wait for first user interaction
            });
        };

        tryPlay();

        // Fallback: play on first touch/click anywhere
        const handleFirstInteraction = () => {
            if (!playing) {
                audio.play().then(() => setPlaying(true)).catch(() => { });
            }
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('click', handleFirstInteraction);
        };

        document.addEventListener('touchstart', handleFirstInteraction, { once: true });
        document.addEventListener('click', handleFirstInteraction, { once: true });

        // Fade in the button after a short delay
        const timer = setTimeout(() => setVisible(true), 800);

        return () => {
            clearTimeout(timer);
            document.removeEventListener('touchstart', handleFirstInteraction);
            document.removeEventListener('click', handleFirstInteraction);
        };
    }, []);

    const toggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        const audio = audioRef.current;
        if (!audio) return;

        if (playing) {
            audio.pause();
            setPlaying(false);
        } else {
            audio.play().then(() => setPlaying(true)).catch(() => { });
        }
    };

    return (
        <>
            <audio ref={audioRef} src={WEDDING_CONFIG.musicSrc} preload="auto" />
            <button
                className={`${styles.musicBtn} ${visible ? styles.visible : ''}`}
                onClick={toggle}
                aria-label={playing ? '음악 일시정지' : '음악 재생'}
            >
                {playing ? (
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className={styles.equalizer}
                    >
                        {/* Bar 1 */}
                        <rect x="3" y="14" width="2" height="8" fill="currentColor" className={styles.bar1} />
                        {/* Bar 2 */}
                        <rect x="8" y="10" width="2" height="12" fill="currentColor" className={styles.bar2} />
                        {/* Bar 3 */}
                        <rect x="13" y="12" width="2" height="10" fill="currentColor" className={styles.bar3} />
                        {/* Bar 4 */}
                        <rect x="18" y="8" width="2" height="14" fill="currentColor" className={styles.bar4} />
                    </svg>
                ) : (
                    <span className={styles.icon}>
                        <img src="./assets/playMusic.svg" />
                    </span>
                )}
            </button>
        </>
    );
}
