// Minimal interfaces for the Kakao Maps JavaScript SDK used by this invitation.
export interface LatLng { getLat(): number; getLng(): number }
export interface MapBounds { extend(point: LatLng): void }
export interface MapControl {}
export interface MapSize {}
export interface MapPoint {}
export interface MarkerImage {}
export interface MapMarker {
  setMap(map: MapInstance | null): void;
  setImage(image: MarkerImage): void;
}
export interface MapInstance {
  setBounds(bounds: MapBounds, top?: number, right?: number, bottom?: number, left?: number): void;
  setCenter(point: LatLng): void;
  setLevel(level: number): void;
  getLevel(): number;
  setZoomable(zoomable: boolean): void;
  setDraggable(draggable: boolean): void;
  relayout(): void;
  addControl(control: MapControl, position: unknown): void;
}
export interface MapOverlay { setMap(map: MapInstance | null): void }
export interface PlaceResult { id: string; place_name: string; x: string; y: string; place_url: string }
export interface KakaoMaps {
  load(callback: () => void): void;
  LatLng: new (lat: number, lng: number) => LatLng;
  LatLngBounds: new () => MapBounds;
  Size: new (width: number, height: number) => MapSize;
  Point: new (x: number, y: number) => MapPoint;
  Map: new (element: HTMLElement, options: { center: LatLng; level: number; scrollwheel: boolean }) => MapInstance;
  Marker: new (options: { position: LatLng; image?: MarkerImage; map?: MapInstance; title?: string }) => MapMarker;
  MarkerImage: new (
    src: string,
    size: MapSize,
    options?: { offset?: MapPoint; spriteOrigin?: MapPoint; spriteSize?: MapSize },
  ) => MarkerImage;
  ZoomControl: new () => MapControl;
  event: {
    addListener(target: MapInstance, type: string, handler: () => void): void;
  };
  ControlPosition: {
    TOP: unknown;
    TOPRIGHT: unknown;
    RIGHT: unknown;
    BOTTOMRIGHT: unknown;
    BOTTOM: unknown;
    BOTTOMLEFT: unknown;
    LEFT: unknown;
    TOPLEFT: unknown;
  };
  CustomOverlay: new (options: {
    map: MapInstance;
    position: LatLng;
    content: HTMLElement;
    yAnchor: number;
    xAnchor?: number;
    zIndex?: number;
  }) => MapOverlay;
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
