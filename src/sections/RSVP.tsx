import React, { useState } from 'react';
import { useScrollFade } from '../hooks/useScrollFade';
import styles from './RSVP.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';

const { weddingDate, venue } = WEDDING_CONFIG;
const DAY_NAMES = ['일', '월', '화', '수', '목', '금', '토'];
const weddingDateObj = new Date(weddingDate.year, weddingDate.month - 1, weddingDate.day);
const dayName = DAY_NAMES[weddingDateObj.getDay()];

const handleInvalidField = (e: React.InputEvent<HTMLInputElement>) => {
  (e.target as HTMLInputElement).setCustomValidity('성함을 확인해주세요');
}

const handleInput = (e: React.InputEvent<HTMLInputElement>) => {
  (e.target as HTMLInputElement).setCustomValidity('');
}

export default function RSVP() {
  const ref = useScrollFade();
  const [modalOpen, setModalOpen] = useState(false);
  const [closing, setClosing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'unavailable'>('idle');

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setModalOpen(false);
      setClosing(false);
      setStatus('idle');
    }, 350);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('unavailable');
  };

  return (
    <>
      <section ref={ref} className={styles.rsvpSection}>
        <div className={styles.container}>
          <div className="section-header">
            <h2 className={styles.title}>R.S.V.P.</h2>
            <p className={styles.subtitle}>참석 의사 전달</p>
          </div>
          <p className={styles.description}>
            신랑, 신부에게 참석 의사를<br />미리 전달해주시겠어요?
          </p>
          <button className={styles.openBtn} onClick={() => setModalOpen(true)}>
            참석 의사 전달하기
          </button>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div
          className={`${styles.modalOverlay} ${closing ? styles.overlayClosing : ''}`}
          onClick={closeModal}
        >
          <div
            className={`${styles.modal} ${closing ? styles.modalClosing : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <button className={styles.modalClose} onClick={closeModal}>✕</button>

            <h3 className={styles.modalTitle}>참석 의사 전달</h3>
            <p className={styles.modalDesc}>
              원활한 예식 진행을 위해 참석 정보를 <br />미리 알려주시면 감사하겠습니다
            </p>

            <div className={styles.modalInfo}>
              <p className={styles.modalInfoItem}>
                <img src={`${import.meta.env.BASE_URL}calendar.svg`} className={styles.modalInfoIcon} alt="" />
                {weddingDate.year}.{String(weddingDate.month).padStart(2, '0')}.{String(weddingDate.day).padStart(2, '0')} ({dayName}) 오후 {weddingDate.hour > 12 ? weddingDate.hour - 12 : weddingDate.hour}시 {String(weddingDate.minute).padStart(2, '0')}분
              </p>
              <p className={styles.modalInfoItem}>
                <img src={`${import.meta.env.BASE_URL}venue.svg`} className={styles.modalInfoIcon} alt="" />
                {venue.venueName}
              </p>
              <p className={styles.modalInfoItem}>
                <img src={`${import.meta.env.BASE_URL}placeholder.svg`} className={styles.modalInfoIcon} alt="" />
                {venue.venueAddress}
              </p>
            </div>

            {status === 'unavailable' ? (
              <div className={styles.success}>
                <p>온라인 접수는 지원하지 않습니다.</p>
                <p>신랑·신부에게 직접 연락해 주세요.</p>
                <button className={styles.openBtn} onClick={() => { closeModal(); }}>
                  닫기
                </button>
              </div>
            ) : (
              <form className={styles.form} onSubmit={handleSubmit}>
                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="name">성함</label>
                  <input id="name" name="name" type="text" className={styles.input} required placeholder="성함을 입력해주세요"
                    onInvalid={handleInvalidField}
                    onInput={handleInput}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="attending">참석 여부</label>
                  <select id="attending" name="attending" className={styles.select} required>
                    <option value="yes">참석</option>
                    <option value="no">불참</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="guests">동반 인원</label>
                  <input id="guests" name="guests" type="number" min="0" className={styles.input} placeholder="0" />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.label} htmlFor="message">메시지 (선택)</label>
                  <textarea id="message" name="message" className={styles.textarea} rows={3} placeholder="축하 메시지를 남겨주세요." />
                </div>

                <button className={styles.submitBtn} type="submit">
                  전달하기
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
