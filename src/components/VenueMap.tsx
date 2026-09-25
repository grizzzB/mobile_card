import { useEffect, useRef, useState, type ReactNode } from 'react';
import { LOCATION_POINTS, PUBLIC_PARKING } from '../utils/constants/transportation';
import { loadKakaoMaps } from '../utils/kakaoMaps';
import { openTmap, tmapRouteHref } from '../utils/openTmap';
import type { KakaoMaps, LatLng, MapInstance, MapMarker, MarkerImage } from '../types/kakaoMaps';
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

type RouteApp =
  | {
      kind: 'link';
      name: string;
      icon: string;
      href: string;
    }
  | {
      kind: 'tmap';
      name: string;
      icon: string;
      href: string;
    };

const MAP_MARKER_IDS = new Set(['venue', 'publicParking', 'suseo']);

/** Served from public/map-markers — swap files without rebuilding the app bundle. */
const markerSrc = (file: string) => `${import.meta.env.BASE_URL}map-markers/${file}`;
const PLACE_MARKER_SRC: Record<string, string> = {
  venue: markerSrc('church-marker.png'),
  publicParking: markerSrc('parking-marker.png'),
  suseo: markerSrc('subway-marker.png'),
};

// Display size for 1122×1402 pin assets; grows when zoomed in (smaller Kakao level).
function markerDisplaySize(level: number): { width: number; height: number; offsetY: number } {
  if (level <= 3) return { width: 58, height: 72, offsetY: 66 };
  if (level <= 5) return { width: 50, height: 62, offsetY: 57 };
  return { width: 44, height: 55, offsetY: 50 };
}

function createPlaceMarkerImage(maps: KakaoMaps, pointId: string, level: number): MarkerImage | undefined {
  const src = PLACE_MARKER_SRC[pointId];
  if (!src) return undefined;
  const { width, height, offsetY } = markerDisplaySize(level);
  return new maps.MarkerImage(
    src,
    new maps.Size(width, height),
    { offset: new maps.Point(width / 2, offsetY) },
  );
}

const DEFAULT_DESTINATIONS: Record<'suseo' | 'parking' | 'publicParking', DirectionDestination> = {
  suseo: { label: '수서역 6번 출구', lat: 37.486917430447576, lng: 127.10183073557539 },
  // Until the exact entrance is confirmed, parking directions use the church location.
  parking: { label: '세곡동 성당 주차장', lat: 37.4729550137162, lng: 127.112203236752 },
  publicParking: {
    label: PUBLIC_PARKING.label,
    lat: PUBLIC_PARKING.lat,
    lng: PUBLIC_PARKING.lng,
  },
};

function routeApps(destination: DirectionDestination): RouteApp[] {
  const name = encodeURIComponent(destination.label);
  const { lat, lng } = destination;
  const tmapHref = tmapRouteHref(destination);
  return [
    {
      kind: 'link',
      name: '카카오맵',
      icon: kakaoMapIcon,
      href: `https://map.kakao.com/link/to/${name},${lat},${lng}`,
    },
    {
      kind: 'link',
      name: '네이버지도',
      icon: naverMapIcon,
      href: `nmap://route/car?dlat=${lat}&dlng=${lng}&dname=${name}&appname=com.ourwedinvitation`,
    },
    {
      kind: 'tmap',
      name: '티맵',
      icon: tmapIcon,
      href: tmapHref,
    },
  ];
}

function RouteAppControl({
  app,
  ariaLabel,
}: {
  app: RouteApp;
  ariaLabel: string;
}) {
  const content: ReactNode = (
    <>
      <img src={app.icon} alt="" />
      <span>{app.name}</span>
    </>
  );

  if (app.kind === 'tmap') {
    return (
      <button
        type="button"
        className={styles.routeApp}
        aria-label={ariaLabel}
        onClick={() => openTmap(app.href)}
      >
        {content}
      </button>
    );
  }

  return (
    <a className={styles.routeApp} href={app.href} target="_blank" rel="noopener noreferrer" aria-label={ariaLabel}>
      {content}
    </a>
  );
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
  const mapRef = useRef<MapInstance | null>(null);
  const mapsRef = useRef<KakaoMaps | null>(null);
  const appKey = import.meta.env.VITE_KAKAO_MAP_APP_KEY?.trim();
  const [status, setStatus] = useState<'loading' | 'ready' | 'unavailable'>(appKey ? 'loading' : 'unavailable');
  const [destinations, setDestinations] = useState(DEFAULT_DESTINATIONS);
  const [touchMapOpen, setTouchMapOpen] = useState(false);
  const [needsTouchUnlock, setNeedsTouchUnlock] = useState(false);

  const setMapGesture = (enabled: boolean) => {
    const map = mapRef.current;
    if (!map) return;
    map.setZoomable(enabled);
    map.setDraggable(enabled);
  };

  const isHoverDevice = () =>
    typeof window !== 'undefined'
    && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const focusDestination = (destination: DirectionDestination) => {
    const map = mapRef.current;
    const maps = mapsRef.current;
    if (!map || !maps) return;
    map.setCenter(new maps.LatLng(destination.lat, destination.lng));
    map.setLevel(3);
    container.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const openTouchMap = () => {
    setTouchMapOpen(true);
    setMapGesture(true);
  };

  const closeTouchMap = () => {
    setTouchMapOpen(false);
    setMapGesture(false);
  };

  useEffect(() => {
    const mq = window.matchMedia('(hover: none), (pointer: coarse)');
    const sync = () => setNeedsTouchUnlock(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);

  useEffect(() => {
    if (!appKey || !container.current) return;
    let cancelled = false;
    let resizeObserver: ResizeObserver | undefined;
    const pinMarkers: MapMarker[] = [];
    const element = container.current;
    loadKakaoMaps(appKey).then(async maps => {
      const positions = await Promise.all(LOCATION_POINTS.map(async point => ({ point, position: await resolvePoint(maps, point) })));
      if (cancelled) return;
      const resolved = positions.filter((entry): entry is { point: MapPoint; position: LatLng } => entry.position !== null);
      if (!resolved.length) throw new Error('No confirmed map positions');
      const map: MapInstance = new maps.Map(element, {
        center: resolved[0].position,
        level: 4,
        // Wheel/pinch off by default; enabled on desktop hover or mobile unlock.
        scrollwheel: false,
      });
      map.setZoomable(false);
      map.setDraggable(false);
      map.addControl(new maps.ZoomControl(), maps.ControlPosition.TOPRIGHT);
      mapRef.current = map;
      mapsRef.current = maps;

      const venue = resolved.find(entry => entry.point.id === 'venue');
      const suseo = resolved.find(entry => entry.point.id === 'suseo');
      const publicParking = resolved.find(entry => entry.point.id === 'publicParking');

      // Prefer Kakao-resolved positions; fall back so 수서역/공영주차장 always appear.
      const mapMarkers = LOCATION_POINTS
        .filter(point => MAP_MARKER_IDS.has(point.id))
        .map(point => {
          const found = resolved.find(entry => entry.point.id === point.id);
          if (found) return found;
          if (point.id === 'suseo') {
            return {
              point,
              position: new maps.LatLng(DEFAULT_DESTINATIONS.suseo.lat, DEFAULT_DESTINATIONS.suseo.lng),
            };
          }
          if (point.id === 'publicParking') {
            return {
              point,
              position: new maps.LatLng(PUBLIC_PARKING.lat, PUBLIC_PARKING.lng),
            };
          }
          return null;
        })
        .filter((entry): entry is { point: MapPoint; position: LatLng } => entry !== null);

      const suseoMarker = suseo ?? mapMarkers.find(entry => entry.point.id === 'suseo');
      if (suseoMarker) {
        setDestinations(current => ({
          ...current,
          suseo: {
            label: suseoMarker.point.label,
            lat: suseoMarker.position.getLat(),
            lng: suseoMarker.position.getLng(),
          },
        }));
      }
      if (venue) {
        setDestinations(current => ({
          ...current,
          parking: { label: '세곡동 성당 주차장', lat: venue.position.getLat(), lng: venue.position.getLng() },
        }));
      }
      if (publicParking) {
        setDestinations(current => ({
          ...current,
          publicParking: {
            label: publicParking.point.label,
            lat: publicParking.position.getLat(),
            lng: publicParking.position.getLng(),
          },
        }));
      }

      const bounds = new maps.LatLngBounds();
      const placed: { point: MapPoint; pin: MapMarker }[] = [];
      mapMarkers.forEach(({ point, position }) => {
        bounds.extend(position);
        const image = createPlaceMarkerImage(maps, point.id, map.getLevel());
        const pin = new maps.Marker({
          position,
          ...(image ? { image } : {}),
          title: point.label,
        });
        pin.setMap(map);
        pinMarkers.push(pin);
        placed.push({ point, pin });
      });

      let lastMarkerTier = -1;
      const syncMarkerSizes = () => {
        const level = map.getLevel();
        const tier = level <= 3 ? 0 : level <= 5 ? 1 : 2;
        if (tier === lastMarkerTier) return;
        lastMarkerTier = tier;
        placed.forEach(({ point, pin }) => {
          const image = createPlaceMarkerImage(maps, point.id, level);
          if (image) pin.setImage(image);
        });
      };

      const showAll = () => {
        if (mapMarkers.length > 1) {
          // Fit all markers; padding keeps tall pins inside — matches ~500m screenshot zoom.
          map.setBounds(bounds, 48, 36, 36, 36);
        } else {
          map.setCenter(mapMarkers[0].position);
          map.setLevel(3);
        }
        syncMarkerSizes();
      };
      showAll();
      maps.event.addListener(map, 'zoom_changed', syncMarkerSizes);
      // Relayout only — do not re-fit, so tapping a place name can keep its zoom.
      resizeObserver = new ResizeObserver(() => { map.relayout(); });
      resizeObserver.observe(element);
      setStatus('ready');
    }).catch(() => { if (!cancelled) setStatus('unavailable'); });
    return () => {
      cancelled = true;
      resizeObserver?.disconnect();
      pinMarkers.forEach(marker => marker.setMap(null));
      mapRef.current = null;
      mapsRef.current = null;
      element.replaceChildren();
    };
  }, [appKey]);

  return (
    <div className={styles.section} id="location-map">
      <div
        className={styles.frame}
        onMouseEnter={() => { if (isHoverDevice()) setMapGesture(true); }}
        onMouseLeave={() => { if (isHoverDevice()) setMapGesture(false); }}
      >
        <div ref={container} className={styles.map} aria-label="성당·공영주차장·수서역 지도" />
        {status !== 'ready' && (
          <div className={styles.placeholder} role="img" aria-label="지도 표시 영역" />
        )}
        {status === 'ready' && needsTouchUnlock && !touchMapOpen && (
          <button
            type="button"
            className={styles.mapUnlock}
            onClick={openTouchMap}
            aria-label="지도를 터치하여 확대·이동하기"
          >
            <span>지도를 보려면 탭하세요</span>
            <small>두 손가락으로 확대 · 드래그로 이동</small>
          </button>
        )}
        {status === 'ready' && needsTouchUnlock && touchMapOpen && (
          <button
            type="button"
            className={styles.mapLock}
            onClick={closeTouchMap}
          >
            스크롤로 돌아가기
          </button>
        )}
      </div>
      <div className={styles.routeActions}>
        <div className={styles.routeCard}>
          <span className={styles.routeBadge}>🚇</span>
          <div className={styles.routeText}>
            <button
              type="button"
              className={styles.routeTitle}
              onClick={() => focusDestination(destinations.suseo)}
              disabled={status !== 'ready'}
            >
              수서역 6번 출구
            </button>
            <small>예식 전 셔틀 탑승</small>
          </div>
          <div className={styles.routeApps} aria-label="수서역 6번 출구 길찾기 앱 선택">
            {routeApps(destinations.suseo).map(app => (
              <RouteAppControl
                key={`suseo-${app.name}`}
                app={app}
                ariaLabel={`${app.name}으로 수서역 6번 출구 길찾기`}
              />
            ))}
          </div>
        </div>
        <div className={styles.routeCard}>
          <span className={styles.routeBadge}>⛪</span>
          <div className={styles.routeText}>
            <button
              type="button"
              className={styles.routeTitle}
              onClick={() => focusDestination(destinations.parking)}
              disabled={status !== 'ready'}
            >
              세곡동 성당 주차장
            </button>
            <small>주차 가능 약 50대 · {LOCATION_POINTS.find(point => point.id === 'parking')?.coordinates ? '주차장 입구' : '성당 인근'}</small>
          </div>
          <div className={styles.routeApps} aria-label="세곡동 성당 주차장 길찾기 앱 선택">
            {routeApps(destinations.parking).map(app => (
              <RouteAppControl
                key={`parking-${app.name}`}
                app={app}
                ariaLabel={`${app.name}으로 세곡동 성당 주차장 길찾기`}
              />
            ))}
          </div>
        </div>
        <div className={styles.routeCard}>
          <span className={styles.routeBadge}>🅿️</span>
          <div className={styles.routeText}>
            <button
              type="button"
              className={styles.routeTitle}
              onClick={() => focusDestination(destinations.publicParking)}
              disabled={status !== 'ready'}
            >
              {PUBLIC_PARKING.label}
            </button>
            <small>주차 가능 약 {PUBLIC_PARKING.capacity}면 · 성당 인근 공영주차장</small>
          </div>
          <div className={styles.routeApps} aria-label={`${PUBLIC_PARKING.label} 길찾기 앱 선택`}>
            {routeApps(destinations.publicParking).map(app => (
              <RouteAppControl
                key={`publicParking-${app.name}`}
                app={app}
                ariaLabel={`${app.name}으로 ${PUBLIC_PARKING.label} 길찾기`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
