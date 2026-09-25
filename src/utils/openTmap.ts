const TMAP_PACKAGE = 'com.skt.tmap.ku';
const TMAP_APP_STORE = 'https://apps.apple.com/app/id431589174';
const TMAP_PLAY_STORE = `https://play.google.com/store/apps/details?id=${TMAP_PACKAGE}`;

function isAndroid() {
  return /android/i.test(navigator.userAgent);
}

function isIOS() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Build tmap:// route URL from destination. */
export function tmapRouteHref(destination: { label: string; lat: number; lng: number }) {
  const name = encodeURIComponent(destination.label);
  return `tmap://route?goalname=${name}&goalx=${destination.lng}&goaly=${destination.lat}`;
}

/**
 * Open TMAP for routing. If the app is missing, fall back to the store.
 * Android uses intent:// with browser_fallback_url; iOS uses a short timeout.
 */
export function openTmap(schemeUrl: string) {
  const match = schemeUrl.match(/^tmap:\/\/(.+)$/i);
  const path = match?.[1] ?? schemeUrl.replace(/^tmap:\/\//i, '');

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
    const startedAt = Date.now();
    const fallbackMs = 1500;

    const clear = () => {
      window.clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', clear);
      window.removeEventListener('blur', clear);
    };

    const onVisibility = () => {
      if (document.hidden) clear();
    };

    const timer = window.setTimeout(() => {
      clear();
      // App likely did not open — still on this page shortly after the attempt.
      if (Date.now() - startedAt < fallbackMs + 500 && !document.hidden) {
        window.location.href = TMAP_APP_STORE;
      }
    }, fallbackMs);

    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', clear);
    window.addEventListener('blur', clear);

    window.location.href = `tmap://${path}`;
    return;
  }

  // Desktop / other: send to a store page rather than a dead custom scheme.
  window.open(TMAP_PLAY_STORE, '_blank', 'noopener,noreferrer');
}
