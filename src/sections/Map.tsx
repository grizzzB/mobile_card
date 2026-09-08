import React from 'react';
import Button from '../components/Button';
import styles from './Location.module.css';

interface LocationProps {
  venueName: string;
  address: string;
  mapUrl?: string;
  phone?: string;
}

const Location: React.FC<LocationProps> = ({
  venueName,
  address,
  mapUrl,
  phone,
}) => {
  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
  };

  return (
    <section className={styles.locationSection}>
      <div className={styles.content}>
        <h2 className={styles.title}>오시는 길</h2>

        <div className={styles.venueInfo}>
          <h3 className={styles.venueName}>{venueName}</h3>
          <p className={styles.address}>{address}</p>

          {phone && (
            <p className={styles.phone}>
              <span className={styles.label}>전화:</span> {phone}
            </p>
          )}
        </div>

        <div className={styles.buttons}>
          <Button variant="primary" size="medium" onClick={handleCopyAddress}>
            주소 복사
          </Button>

          {mapUrl && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
            >
              <Button variant="outline" size="medium">
                지도 보기
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
};

export default Location;
