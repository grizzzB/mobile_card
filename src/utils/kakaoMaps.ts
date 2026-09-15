import type { KakaoMaps } from '../types/kakaoMaps';

let sdkPromise: Promise<KakaoMaps> | undefined;

export function loadKakaoMaps(appKey: string): Promise<KakaoMaps> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise<KakaoMaps>((resolve, reject) => {
    const script = document.createElement('script');
    const timer = window.setTimeout(() => fail(), 12000);
    const fail = () => {
      window.clearTimeout(timer);
      script.remove();
      reject(new Error('Kakao Maps SDK unavailable'));
    };
    const ready = () => {
      const maps = window.kakao?.maps;
      if (!maps) return fail();
      maps.load(() => {
        window.clearTimeout(timer);
        resolve(maps);
      });
    };
    if (window.kakao?.maps) {
      ready();
      return;
    }
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${encodeURIComponent(appKey)}&autoload=false&libraries=services`;
    script.async = true;
    script.onload = ready;
    script.onerror = fail;
    document.head.appendChild(script);
  }).catch((error: unknown) => {
    sdkPromise = undefined;
    throw error;
  });
  return sdkPromise;
}
