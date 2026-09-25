import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { LOCATION_POINTS } from '../utils/constants/transportation';
import { loadKakaoMaps } from '../utils/kakaoMaps';
import { openTmap, tmapRouteHref } from '../utils/openTmap';
import type { KakaoMaps, LatLng, MapInstance, MapOverlay } from '../types/kakaoMaps';
import type { MapPoint } from '../utils/types';
import kakaoMapIcon from '../assets/map-apps/kakao-map.jpg';
import naverMapIcon from '../assets/map-apps/naver-map.jpg';
import tmapIcon from '../assets/map-apps/tmap.jpg';
import styles from './VenueMap.module.css';

type DirectionDestination = {
  label: string;
  lat: number;
  lng: number;
};

type RouteApp = {
  name: string;
  icon: string;
  href: string;
  onClick?: (event: MouseEvent<HTMLAnchorElement>) => void;
};

const DEFAULT_DESTINATIONS: Record<'suseo' | 'parking', DirectionDestination> = {
  suseo: { label: '수서역 6번 출구', lat: 37.486917430447576, lng: 127.10183073557539 },
  // Until the exact entrance is confirmed, parking directions use the church location.
  parking: { label: '세곡동 성당 주차장', lat: 37.4729550137162, lng: 127.112203236752 },
};

function routeApps(destination: DirectionDestination): RouteApp[] {
  const name = encodeURIComponent(destination.label);
  const { lat, lng } = destination;
  const tmapHref = tmapRouteHref(destination);
  return [
    {
      name: '카카오맵',
      icon: kakaoMapIcon,
      href: `https://map.kakao.com/link/to/${name},${lat},${lng}`,
    },
    {
      name: '네이버지도',
      icon: naverMapIcon,
      href: `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${name}&appname=com.ourwedinvitation`,
    },
    {
      name: '티맵',
      icon: tmapIcon,
      href: tmapHref,
      onClick: (event) => {
        event.preventDefault();
        openTmap(tmapHref);
      },
    },
  ];
}

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
  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);

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
        setDestinations(current => ({
          ...current,
          suseo: { label: suseo.point.label, lat: suseo.position.getLat(), lng: suseo.position.getLng() },
        }));
      }
      const parkingDestination = parking ?? venue;
      if (parkingDestination) {
        const { point, position } = parkingDestination;
        setDestinations(current => ({
          ...current,
          parking: { label: point.label, lat: position.getLat(), lng: position.getLng() },
        }));
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
          <div className={styles.routeApps} aria-label="수서역 6번 출구 길찾기 앱 선택">
            {routeApps(destinations.suseo).map(app => (
              <a
                className={styles.routeApp}
                href={app.href}
                key={app.name}
                target={app.onClick ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={app.onClick}
                aria-label={`${app.name}으로 수서역 6번 출구 길찾기`}
              >
                <img src={app.icon} alt="" />
                <span>{app.name}</span>
              </a>
            ))}
          </div>
        </div>
        <div className={styles.routeCard}>
          <span className={styles.routeBadge}>P</span>
          <div className={styles.routeText}>
            <strong>세곡동 성당 주차장</strong>
            <small>{LOCATION_POINTS.find(point => point.id === 'parking')?.coordinates ? '주차장 입구' : '성당 주소 기준'}</small>
          </div>
          <div className={styles.routeApps} aria-label="세곡동 성당 주차장 길찾기 앱 선택">
            {routeApps(destinations.parking).map(app => (
              <a
                className={styles.routeApp}
                href={app.href}
                key={app.name}
                target={app.onClick ? undefined : '_blank'}
                rel="noopener noreferrer"
                onClick={app.onClick}
                aria-label={`${app.name}으로 세곡동 성당 주차장 길찾기`}
              >
                <img src={app.icon} alt="" />
                <span>{app.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
