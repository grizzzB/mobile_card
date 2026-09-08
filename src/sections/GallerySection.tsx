import React, { useEffect, useMemo } from 'react';
import Gallery from '../components/Gallery';
import { useScrollFade } from '../hooks/useScrollFade';
import styles from './GallerySection.module.css';

// Automatically picks up all images in src/assets/gallery/.
// Files are sorted alphabetically, so prefix filenames with numbers
// (e.g. 01_ceremony.jpg, 02_portraits.jpg) to control display order.
const imageModules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

const GallerySection: React.FC = () => {
  const ref = useScrollFade();

  const galleryImages = useMemo(() =>
    Object.entries(imageModules)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, url], index) => ({
        id: String(index + 1),
        src: url,
        alt: `Wedding photo ${index + 1}`,
      })),
    []
  );

  // Prefetch all gallery images in the background after initial render
  useEffect(() => {
    galleryImages.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, [galleryImages]);

  return (
    <section ref={ref} className={styles.gallerySection}>
      <div className={`${styles.header} section-header-full`}>
        <h2 className={styles.sectionTitle}>GALLERY</h2>
        <p className={styles.description}>갤러리</p>
      </div>
      <Gallery images={galleryImages} />
    </section>
  );
};

export default GallerySection;
