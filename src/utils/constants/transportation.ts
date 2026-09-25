import type { Bus, MapPoint, NavigationApp, ParkingLot, Shuttle, Subway } from "../types";

/** Nearby public parking used for directions links. */
export const PUBLIC_PARKING = {
	label: '밤고개로21길 공영주차장',
	lat: 37.4736882,
	lng: 127.1145703,
	capacity: 109,
	address: '서울 강남구 밤고개로21길 71',
} as const;

const publicParkingName = encodeURIComponent(PUBLIC_PARKING.label);

export const DIRECTIONS: {
	subway: Subway[];
	bus: Bus[];
	parking: ParkingLot[];
	shuttle: Shuttle;
} = {
	subway: [],
	bus: [],
	parking: [
		{
			name: '세곡동 성당 주차장',
			address: '주차 가능 약 50대 · 성당 내 주차장',
		},
		{
			name: PUBLIC_PARKING.label,
			address: `주차 가능 약 ${PUBLIC_PARKING.capacity}면 · ${PUBLIC_PARKING.address}`,
			nav: {
				kakao: `https://map.kakao.com/link/to/${publicParkingName},${PUBLIC_PARKING.lat},${PUBLIC_PARKING.lng}`,
				naver: `nmap://route/car?dlat=${PUBLIC_PARKING.lat}&dlng=${PUBLIC_PARKING.lng}&dname=${publicParkingName}&appname=com.ourwedinvitation`,
				tmap: `tmap://route?goalname=${publicParkingName}&goalx=${PUBLIC_PARKING.lng}&goaly=${PUBLIC_PARKING.lat}`,
			},
		},
	],
	shuttle: {
		trips: [
			{
				id: 'before', label: '예식 전',
				departure: '수서역 6번 출구', destination: '세곡동 성당',
				mapPointId: 'suseo', times: ['11:10', '11:40'],
			},
			{
				id: 'after', label: '예식 후',
				departure: '세곡동 성당', destination: '수서역',
				mapPointId: 'venue', times: ['13:00', '13:30', '14:00'],
			},
		],
	},
};

export const LOCATION_POINTS: MapPoint[] = [
	{
		id: 'venue', badge: '⛪', label: '세곡동 성당',
		description: '예식 장소 · 예식 후 셔틀 탑승',
		query: '세곡동성당', placeId: '1607311092',
	},
	{
		id: 'parking', badge: '⛪', label: '성당 주차장',
		description: '성당 주차장 · 약 50대',
		// Marker is placed near the church when entrance coords are unknown.
	},
	{
		id: 'publicParking', badge: '🅿️', label: PUBLIC_PARKING.label,
		description: `인근 공영주차장 · 약 ${PUBLIC_PARKING.capacity}면`,
		coordinates: { lat: PUBLIC_PARKING.lat, lng: PUBLIC_PARKING.lng },
		address: PUBLIC_PARKING.address,
	},
	{
		id: 'suseo', badge: '🚇', label: '수서역 6번 출구',
		description: '예식 전 · 셔틀 탑승 장소',
		query: '수서역 6번출구', matchName: '수서역.*6번출구',
		placeId: '10552075',
		// Fallback when Places lookup fails — keeps 수서역 on the initial map.
		coordinates: { lat: 37.486917430447576, lng: 127.10183073557539 },
	},
];

export const kakaoPlaceLink = (point: MapPoint): string | undefined => {
	if (point.coordinates) {
		return `https://map.kakao.com/link/map/${encodeURIComponent(point.label)},${point.coordinates.lat},${point.coordinates.lng}`;
	}
	return point.query ? `https://map.kakao.com/link/search/${encodeURIComponent(point.query)}` : undefined;
};

export const NAVIGATION_APPS: NavigationApp[] = [
	{ name: '카카오맵', url: 'https://map.kakao.com/link/search/세곡동성당' },
];
