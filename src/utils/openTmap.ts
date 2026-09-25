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
  return `tmap://route?goalname=${name}&goalx=${lng}&goaly=${lat}`;
}

function storeUrl() {
  return isIOS() ? TMAP_APP_STORE : TMAP_PLAY_STORE;
}

function clearActiveFallback() {
  if (activeFallbackTimer !== undefined) {
    window.clearTimeout(activeFallbackTimer);
    activeFallbackTimer = undefined;
  }
  activeCleanup?.();
  activeCleanup = undefined;
}

/**
 * Open TMAP for routing. If the app is missing, fall back to the store.
 *
 * Important for iOS Safari: do NOT call window.confirm() before opening the
 * custom scheme — that breaks the user-gesture chain and the first tap often
 * fails to open anything. Open the scheme immediately, then fall back to the
 * App Store if the page is still visible.
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
    const onHide = () => {
      if (document.hidden) clearActiveFallback();
    };
    activeCleanup = () => {
      document.removeEventListener('visibilitychange', onHide);
      window.removeEventListener('pagehide', onHide);
    };
    document.addEventListener('visibilitychange', onHide);
    window.addEventListener('pagehide', onHide);

    // If TMAP did not take over, fall back to the App Store quickly.
    // Keep this short — a long wait feels broken when the app is missing.
    activeFallbackTimer = window.setTimeout(() => {
      clearActiveFallback();
      if (document.hidden) return;
      window.location.href = storeUrl();
    }, 500);

    // Must run synchronously inside the click handler.
    window.location.href = fullScheme;
    return;
  }

  window.open(storeUrl(), '_blank', 'noopener,noreferrer');
}
