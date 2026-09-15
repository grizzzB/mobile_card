import { useEffect, useRef, useState } from 'react';
import { LOCATION_POINTS } from '../utils/constants/transportation';
import { loadKakaoMaps } from '../utils/kakaoMaps';
import type { KakaoMaps, LatLng, MapInstance, MapOverlay } from '../types/kakaoMaps';
import type { MapPoint } from '../utils/types';
import styles from './VenueMap.module.css';

function resolvePoint(maps: KakaoMaps, point: MapPoint): Promise<LatLng | null> {
  if (point.coordinates) return Promise.resolve(new maps.LatLng(point.coordinates.lat, point.coordinates.lng));
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => resolve(null), 8000);
    const finish = (position: LatLng | null) => { window.clearTimeout(timer); resolve(position); };
    if (point.query && point.placeId) {
      new maps.services.Places().keywordSearch(point.query, (results, status) => {
        const result = status === maps.services.Status.OK ? results.find(item => item.id === point.placeId) : undefined;
        finish(result ? new maps.LatLng(Number(result.y), Number(result.x)) : null);
      });
    } else if (point.address) {
      new maps.services.Geocoder().addressSearch(point.address, (results, status) => {
        const result = status === maps.services.Status.OK ? results[0] : undefined;
        finish(result ? new maps.LatLng(Number(result.y), Number(result.x)) : null);
      });
    } else if (point.query && point.matchName) {
      const expectedName = new RegExp(point.matchName);
      new maps.services.Places().keywordSearch(point.query, (results, status) => {
        const matches = status === maps.services.Status.OK
          ? results.filter(result => expectedName.test(result.place_name.replace(/\s/g, ''))) : [];
        // Ambiguous or missing results should never become an invented boarding location.
        const result = matches.length === 1 ? matches[0] : undefined;
        finish(result ? new maps.LatLng(Number(result.y), Number(result.x)) : null);
      });
    } else finish(null);
  });
}

export default function VenueMap() {
  const container = useRef<HTMLDivElement>(null);
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim();
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(appKey ? 'loading' : 'unavailable');
  const [parkingRoute, setParkingRoute] = useState('https://map.kakao.com/link/to/1607311092');
  const [suseoRoute, setSuseoRoute] = useState('https://map.kakao.com/link/to/10552075');

  useEffect(() => {
    if (!appKey || !container.current) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const overlays: MapOverlay[] = [];
    const element = container.current;
    loadKakaoMaps(appKey).then(async maps => {
      const positions = await Promise.all(LOCATION_POINTS.map(async point => ({ point, position: await resolvePoint(maps, point) })));
      if (cancelled) return;
      const resolved = positions.filter((entry): entry is { point: MapPoint; position: LatLng } => entry.position !== null);
      if (!resolved.length) throw new Error('No confirmed map positions');
      const map: MapInstance = new maps.Map(element, { center: resolved[0].position, level: 4, scrollwheel: false });
      const bounds = new maps.LatLngBounds();
      const parking = resolved.find(entry => entry.point.id === 'parking');
      const venue = resolved.find(entry => entry.point.id === 'venue');
      const suseo = resolved.find(entry => entry.point.id === 'suseo');
      if (suseo) {
        setSuseoRoute(`https://map.kakao.com/link/to/${encodeURIComponent(suseo.point.label)},${suseo.position.getLat()},${suseo.position.getLng()}`);
      }
      const parkingDestination = parking ?? venue;
      if (parkingDestination) {
        const { point, position } = parkingDestination;
        setParkingRoute(`https://map.kakao.com/link/to/${encodeURIComponent(point.label)},${position.getLat()},${position.getLng()}`);
      }
      resolved.forEach(({ point, position }) => {
        bounds.extend(position);
        const label = document.createElement('span');
        label.className = styles.marker;
        label.textContent = `${point.badge} · ${point.label}`;
        overlays.push(new maps.CustomOverlay({ map, position, content: label, yAnchor: 1 }));
      });
      const showAll = () => {
        if (resolved.length > 1) map.setBounds(bounds, 55, 75, 55, 75);
        else { map.setCenter(resolved[0].position); map.setLevel(3); }
      };
      showAll();
      resizeObserver = new ResizeObserver(() => { map.relayout(); showAll(); });
      resizeObserver.observe(element);
      setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('unavailable'); });
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      overlays.forEach(overlay => overlay.setMap(null));
      element.replaceChildren();
    };
  }, [appKey]);

  return (
    <div className={styles.section} id="location-map">
      <div className={styles.frame}>
        <div ref={container} className={styles.map} aria-label="성당·주차장·수서역 지도" />
        {status !== 'ready' && (
          <div className={styles.placeholder} role="img" aria-label="지도 표시 영역" />
        )}
      </div>
      <div className={styles.routeActions}>
        <div className={styles.routeCard}>
          <span className={styles.routeBadge}>6</span>
          <div className={styles.routeText}>
            <strong>수서역 6번 출구</strong>
            <small>예식 전 셔틀 탑승</small>
          </div>
          <a className={styles.routeButton} href={suseoRoute} target="_blank" rel="noopener noreferrer" aria-label="수서역 6번 출구까지 길찾기">길찾기 ↗</a>
        </div>
        <div className={styles.routeCard}>
          <span className={styles.routeBadge}>P</span>
          <div className={styles.routeText}>
            <strong>세곡동 성당 주차장</strong>
            <small>{LOCATION_POINTS.find(point => point.id === 'parking')?.coordinates ? '주차장 입구' : '성당 주소 기준'}</small>
          </div>
          <a className={styles.routeButton} href={parkingRoute} target="_blank" rel="noopener noreferrer" aria-label="세곡동 성당 주차장 방향 길찾기">길찾기 ↗</a>
        </div>
      </div>
    </div>
  );
}
