import { useState } from 'react';
import { useScrollFade } from '../hooks/useScrollFade';
import styles from './Location.module.css';
import { WEDDING_CONFIG } from '../utils/constants/weddingInfo';
import { DIRECTIONS } from '../utils/constants/transportation';
import Collapsible from '../components/Collapsible';
import VenueMap from '../components/VenueMap';


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

        {/* Venue information */}
        <div className={styles.navSection}>
          <h3 className={styles.venueName}>{venue.venueName}</h3>
          <p className={styles.address}>{venue.venueAddress}</p>
          {venue.phone && (
            <a href={`tel:${venue.phone}`} className={styles.phone}>
              Tel. {venue.phone}
            </a>
          )}

        </div>

        <VenueMap />

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
                              <img src={`${import.meta.env.BASE_URL}assets/naverMap.svg`} alt="네이버지도" className={styles.parkingNavIcon} />
                              네이버지도
                            </a>
                          )}
                          {item.nav.kakao && (
                            <a href={item.nav.kakao} target="_blank" rel="noopener noreferrer" className={styles.parkingNavBtn}>
                              <img src={`${import.meta.env.BASE_URL}assets/kakaoMap.svg`} alt="카카오맵" className={styles.parkingNavIcon} />
                              카카오맵
                            </a>
                          )}
                          {item.nav.tmap && (
                            <a href={item.nav.tmap} target="_blank" rel="noopener noreferrer" className={styles.parkingNavBtn}>
                              <img src={`${import.meta.env.BASE_URL}assets/tmap.svg`} alt="티맵" className={styles.parkingNavIcon} />
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

          <div className={styles.shuttleSection}>
            <div className={styles.shuttleHeading}>
              <span className={styles.shuttleEyebrow}>SHUTTLE BUS</span>
              <h4>셔틀버스 안내</h4>
              <p>오실 때와 돌아가실 때, 출발 시간을 확인해 주세요.</p>
            </div>
            <div className={styles.shuttleCards}>
              {DIRECTIONS.shuttle.trips.map(trip => (
                <article key={trip.id} className={`${styles.shuttleCard} ${trip.id === 'after' ? styles.returnCard : ''}`} aria-label={`${trip.label} 셔틀 시간표`}>
                  <div className={styles.tripHeader}>
                    <h5 className={styles.tripBadge}>{trip.label}</h5>
                    <span>{trip.id === 'before' ? '성당으로 오실 때' : '예식을 마친 후'}</span>
                  </div>
                  <dl className={styles.route}>
                    <div><dt>출발</dt><dd>{trip.departure}</dd></div>
                    <div><dt>도착</dt><dd>{trip.destination}</dd></div>
                  </dl>
                  <div className={styles.schedule}>
                    <h6>출발 시간</h6>
                    <ul className={styles.departureTimes} aria-label={`${trip.label} 출발 시간`}>
                      {trip.times.map(time => <li key={time}><time>{time}</time></li>)}
                    </ul>
                  </div>

                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
