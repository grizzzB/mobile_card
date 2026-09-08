import { useState } from 'react';
import { useScrollFade } from '../hooks/useScrollFade';
import styles from './Location.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';
import { DIRECTIONS, NAVIGATION_APPS } from '../utils/constants/transportation';
import Collapsible from '../components/Collapsible';


export default function Location() {
  const ref = useScrollFade();
  const { venue } = WEDDING_CONFIG;
  const [openSection, setOpenSection] = useState<string | null>(null);
  const toggle = (key: string) => setOpenSection(prev => prev === key ? null : key);

  return (
    <section ref={ref} className={styles.locationSection}>
      <div className={styles.container}>
        <div className="section-header-full">
          <h2 className={styles.title}>LOCATION</h2>
          <p className={styles.subtitle}>오시는 길</p>
        </div>

        {/* Kakao roughmap embed */}
        {venue.mapEmbed && (
          <div className={styles.mapFrame}>
            <div className={styles.mapInner}>
              <div style={{ height: '280px' }}>
                <a
                  href={venue.mapEmbed.mainLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img
                    src={venue.mapEmbed.imageUrl}
                    alt={`${venue.venueName} 지도`}
                    className={styles.mapImage}
                  />
                </a>
              </div>
              <div className={styles.mapFooter}>
                <a href="https://map.kakao.com" target="_blank" rel="noopener noreferrer">
                  <img
                    src="//t1.kakaocdn.net/localimg/localimages/07/2018/pc/common/logo_kakaomap.png"
                    width="72"
                    height="16"
                    alt="카카오맵"
                    style={{ display: 'block' }}
                  />
                </a>
                <div className={styles.mapFooterLinks}>
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={venue.mapEmbed.roadsideLink}
                  >
                    로드뷰
                  </a>
                  <span className={styles.mapDivider} />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={venue.mapEmbed.directionsLink}
                  >
                    길찾기
                  </a>
                  <span className={styles.mapDivider} />
                  <a
                    target="_blank"
                    rel="noopener noreferrer"
                    href={venue.mapEmbed.fullMapLink}
                  >
                    지도 크게 보기
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Venue info + Navigation apps */}
        <div className={styles.navSection}>
          <h3 className={styles.venueName}>{venue.venueName}</h3>
          <p className={styles.address}>{venue.venueAddress}</p>
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className={styles.phone}>
              Tel. {venue.phone}
            </a>
          )}
          <div className={styles.navButtons}>
            {NAVIGATION_APPS.map((app) => (
              <a
                key={app.name}
                href={app.url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.navButton}
              >
                <img
                  src={app.name === '카카오맵' ? '/assets/kakaoMap.svg' : app.name === '티맵' ? '/assets/tmap.svg' : '/assets/naverMap.svg'}
                  alt={app.name}
                  className={styles.parkingNavIcon}
                />
                {app.name}
              </a>
            ))}
          </div>
        </div>

        {/* Directions */}
        <div className={styles.directions}>
          {DIRECTIONS.subway && DIRECTIONS.subway.length > 0 && (
            <div className={styles.dirGroup}>
              <button className={styles.dirTitle} onClick={() => toggle('subway')}>
                지하철 안내 {openSection === 'subway' ? '▲' : '▼'}
              </button>
              <Collapsible open={openSection === 'subway'}>
                {DIRECTIONS.subway.map((item, idx) => (
                  <div key={idx} className={styles.dirItem}>
                    <span className={`${styles.dirBullet} ${styles.subwayBullet}`}>●</span>
                    <span className={styles.dirText}>
                      {item.line} {item.station} {item.exit}
                      <br />
                      <span className={styles.dirDetail}>{item.walk}</span>
                    </span>
                  </div>
                ))}
              </Collapsible>
            </div>
          )}

          {DIRECTIONS.bus && DIRECTIONS.bus.length > 0 && (
            <div className={styles.dirGroup}>
              <button className={styles.dirTitle} onClick={() => toggle('bus')}>
                버스 안내 {openSection === 'bus' ? '▲' : '▼'}
              </button>
              <Collapsible open={openSection === 'bus'}>
                {DIRECTIONS.bus.map((item, idx) => (
                  <div key={idx} className={styles.dirItem}>
                    <span className={`${styles.dirBullet} ${item.type === '간선버스' ? styles.busTrunkBullet : item.type === '지선버스' ? styles.busBranchBullet : ''}`}>●</span>
                    <span className={styles.dirText}>
                      {item.type}: {item.routes.join(', ')}
                      {item.stop && <><br /><span className={styles.dirDetail}>{item.stop} 하차</span></>}
                    </span>
                  </div>
                ))}
              </Collapsible>
            </div>
          )}

          {DIRECTIONS.parking && DIRECTIONS.parking.length > 0 && (
            <div className={styles.dirGroup}>
              <button className={styles.dirTitle} onClick={() => toggle('parking')}>
                주차 안내 {openSection === 'parking' ? '▲' : '▼'}
              </button>
              <Collapsible open={openSection === 'parking'}>
                <p className={styles.dirDetail} style={{ textAlign: 'center', marginBottom: '0.75rem' }}>외부 주차장 선 주차 후 웨딩홀 이동 부탁드립니다 <br /> 도보 5분 소요 - 2시간 무료 주차</p> <br />
                {DIRECTIONS.parking.map((item, idx) => (
                  <div key={idx} className={styles.dirItem}>
                    <span className={styles.dirBullet}>●</span>
                    <div className={styles.dirTextGroup}>
                      <span className={styles.dirText}>
                        {item.name}
                        <br />
                        <span className={styles.dirDetail}>{item.address}</span>
                      </span>
                      {item.nav && (
                        <div className={styles.parkingNavButtons}>
                          {item.nav.naver && (
                            <a href={item.nav.naver} target="_blank" rel="noopener noreferrer" className={styles.parkingNavBtn}>
                              <img src="/assets/naverMap.svg" alt="네이버지도" className={styles.parkingNavIcon} />
                              네이버지도
                            </a>
                          )}
                          {item.nav.kakao && (
                            <a href={item.nav.kakao} target="_blank" rel="noopener noreferrer" className={styles.parkingNavBtn}>
                              <img src="/assets/kakaoMap.svg" alt="카카오맵" className={styles.parkingNavIcon} />
                              카카오맵
                            </a>
                          )}
                          {item.nav.tmap && (
                            <a href={item.nav.tmap} target="_blank" rel="noopener noreferrer" className={styles.parkingNavBtn}>
                              <img src="/assets/tmap.svg" alt="티맵" className={styles.parkingNavIcon} />
                              티맵
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </Collapsible>
            </div>
          )}

          {DIRECTIONS.shuttle && (
            <div className={styles.dirGroup}>
              <h4 className={styles.dirTitle}>셔틀버스</h4>
              <div className={styles.dirItem}>
                <span className={styles.dirBullet}>●</span>
                <span className={styles.dirText}>{DIRECTIONS.shuttle.description}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
