import type { Bus, NavigationApp, ParkingLot, Shuttle, Subway } from "../types";

// 지하철·버스·주차 안내는 이전 예식장(아르베 웨딩) 기준 데이터였습니다.
// 세곡동 성당 대성전 기준 지하철/버스/주차 정보가 아직 없어 비워뒀습니다 — 필요하면 채워주세요.
export const DIRECTIONS: {
	subway: Subway[];
	bus: Bus[];
	parking: ParkingLot[];
	shuttle?: Shuttle;
} = {
	subway: [],
	bus: [],
	parking: [],
	shuttle: {
		description: "예식 전 · 수서역 6번 출구 출발 (11:10 / 11:40)  ―  예식 후 · 성당 출발 (13:00 / 13:30 / 14:00)",
	},
};

// 네이버지도/카카오맵/티맵 딥링크도 마찬가지로 이전 예식장 기준이라 비워뒀습니다.
export const NAVIGATION_APPS: NavigationApp[] = [];
