import React, { useState } from 'react';
import styles from './Gallery.module.css';

interface GalleryProps {
  images: Array<{ id: string; src: string; alt: string }>;
}

const INITIAL_COUNT = 6;

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleImages = showAll ? images : images.slice(0, INITIAL_COUNT);

  const openLightbox = (index: number) => setLightboxIndex(index);
  const closeLightbox = () => setLightboxIndex(null);

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev === null ? null : prev === 0 ? images.length - 1 : prev - 1
    );
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLightboxIndex((prev) =>
      prev === null ? null : prev === images.length - 1 ? 0 : prev + 1
    );
  };

  if (images.length === 0) {
    return <div className={styles.empty}>이미지가 없습니다.</div>;
  }

  return (
    <>
      <div className={styles.grid}>
        {visibleImages.map((image, index) => (
          <div
            key={image.id}
            className={styles.gridItem}
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.src}
              alt={image.alt}
              className={styles.gridImage}
              loading="lazy"
              decoding="async"
            />
          </div>
        ))}
      </div>

      {!showAll && images.length > INITIAL_COUNT && (
        <button className={styles.moreBtn} onClick={() => setShowAll(true)}>
          더보기
        </button>
      )}

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className={styles.lightboxOverlay} onClick={closeLightbox}>
          <button className={styles.prevBtn} onClick={goPrev}>‹</button>
          <div className={styles.lightboxContent} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeBtn} onClick={closeLightbox}>✕</button>
            <img
              src={images[lightboxIndex].src}
              alt={images[lightboxIndex].alt}
              className={styles.lightboxImage}
              decoding="async"
            />
            <p className={styles.lightboxCounter}>
              {lightboxIndex + 1} / {images.length}
            </p>
          </div>
          {/* Preload adjacent images for smooth lightbox navigation */}
          {lightboxIndex > 0 && (
            <link rel="preload" as="image" href={images[lightboxIndex - 1].src} />
          )}
          {lightboxIndex < images.length - 1 && (
            <link rel="preload" as="image" href={images[lightboxIndex + 1].src} />
          )}
          <button className={styles.nextBtn} onClick={goNext}>›</button>
        </div>
      )}
    </>
  );
};

export default Gallery;
