// Minimal interfaces for the Kakao Maps JavaScript SDK used by this invitation.
export interface LatLng { getLat(): number; getLng(): number }
export interface MapBounds { extend(point: LatLng): void }
export interface MapInstance {
  setBounds(bounds: MapBounds, top?: number, right?: number, bottom?: number, left?: number): void;
  setCenter(point: LatLng): void;
  setLevel(level: number): void;
  relayout(): void;
}
export interface MapOverlay { setMap(map: MapInstance | null): void }
export interface PlaceResult { id: string; place_name: string; x: string; y: string; place_url: string }
export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new () => MapBounds;
  Map: new (element: HTMLElement, options: { center: LatLng; level: number; scrollwheel: boolean }) => MapInstance;
  CustomOverlay: new (options: { map: MapInstance; position: LatLng; content: HTMLElement; yAnchor: number }) => MapOverlay;
  services: {
    Status: { OK: string };
    Places: new () => {
      keywordSearch(query: string, callback: (results: PlaceResult[], status: string) => void): void;
    };
    Geocoder: new () => {
      addressSearch(query: string, callback: (results: { x: string; y: string }[], status: string) => void): void;
    };
  };
}

declare global {
  interface Window { kakao?: { maps: KakaoMaps } }
}
