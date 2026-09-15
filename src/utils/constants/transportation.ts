import type { Bus, MapPoint, NavigationApp, ParkingLot, Shuttle, Subway } from "../types";

export const DIRECTIONS: {
	subway: Subway[];
	bus: Bus[];
	parking: ParkingLot[];
	shuttle: Shuttle;
} = {
	subway: [],
	bus: [],
	parking: [],
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
		id: 'venue', badge: '성당', label: '세곡동 성당',
		description: '예식 장소 · 예식 후 셔틀 탑승',
		address: '서울 강남구 율현동 165-2', query: '세곡동성당',
	},
	{
		id: 'parking', badge: 'P', label: '성당 주차장',
		description: '성당 주차장',
		// Add confirmed entrance coordinates here; do not substitute the church center.
	},
	{
		id: 'suseo', badge: '6', label: '수서역 6번 출구',
		description: '예식 전 · 셔틀 탑승 장소',
		query: '수서역 6번출구', matchName: '수서역.*6번출구',
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
