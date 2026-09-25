const TMAP_PACKAGE = 'com.skt.tmap.ku';
const TMAP_APP_STORE = 'https://apps.apple.com/app/id431589174';
const TMAP_PLAY_STORE = `https://play.google.com/store/apps/details?id=${TMAP_PACKAGE}`;

let activeFallbackTimer: number | undefined;
let activeCleanup: (() => void) | undefined;

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isIOS() {
  // iPadOS 13+ may report as Macintosh.
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
    || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Build tmap:// route URL from destination. */
export function tmapRouteHref(destination: { label: string; lat: number; lng: number }) {
  const name = encodeURIComponent(destination.label);
  const { lat, lng } = destination;
  // Include both common param styles for Android/iOS TMAP clients.
  return `tmap://route?goalname=${name}&goalx=${lng}&goaly=${lat}&rGoName=${name}&rGoX=${lng}&rGoY=${lat}`;
}

function openStore() {
  window.location.href = isIOS() ? TMAP_APP_STORE : TMAP_PLAY_STORE;
}

function clearActiveFallback() {
  if (activeFallbackTimer !== undefined) {
    window.clearTimeout(activeFallbackTimer);
    activeFallbackTimer = undefined;
  }
  activeCleanup?.();
  activeCleanup = undefined;
}

function tryOpenScheme(schemeUrl: string) {
  window.location.href = schemeUrl;
}

/**
 * Open TMAP for routing. If the app is missing, fall back to the store.
 * Android uses intent:// with browser_fallback_url.
 * iOS Safari cannot reliably detect install state, so we ask first and keep a soft fallback.
 */
export function openTmap(schemeUrl: string) {
  clearActiveFallback();

  const match = schemeUrl.match(/^tmap:\/\/(.+)$/i);
  const path = match?.[1] ?? schemeUrl.replace(/^tmap:\/\//i, '');
  const fullScheme = `tmap://${path}`;

  if (isAndroid()) {
    const intentUrl = [
      `intent://${path}#Intent`,
      'scheme=tmap',
      `package=${TMAP_PACKAGE}`,
      `S.browser_fallback_url=${encodeURIComponent(TMAP_PLAY_STORE)}`,
      'end',
    ].join(';');
    window.location.href = intentUrl;
    return;
  }

  if (isIOS()) {
    const openApp = window.confirm(
      '티맵 앱이 설치되어 있어야 길찾기를 이용할 수 있습니다.\n\n'
      + '• 확인: 티맵 실행\n'
      + '• 취소: App Store에서 설치',
    );

    if (!openApp) {
      openStore();
      return;
    }

    // Soft fallback: if the app never opens, offer the store.
    // Do NOT cancel on window blur — Safari's "invalid address" sheet can fire blur.
    const startedAt = Date.now();
    const fallbackMs = 2000;

    const onVisibility = () => {
      if (document.hidden) clearActiveFallback();
    };

    const onPageHide = () => {
      clearActiveFallback();
    };

    activeCleanup = () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', onPageHide);
    };

    activeFallbackTimer = window.setTimeout(() => {
      clearActiveFallback();
      if (document.hidden || Date.now() - startedAt > fallbackMs + 800) return;

      const goStore = window.confirm(
        '티맵을 열지 못했습니다.\n앱이 설치되어 있지 않다면 App Store에서 설치해 주세요.\n\n설치 페이지로 이동할까요?',
      );
      if (goStore) openStore();
    }, fallbackMs);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', onPageHide);

    tryOpenScheme(fullScheme);
    return;
  }

  // Desktop / other: send to a store page rather than a dead custom scheme.
  window.open(TMAP_PLAY_STORE, '_blank', 'noopener,noreferrer');
}
