export type WeddingDate = {
	year: number;
	month: number;
	day: number;
	hour: number;
	minute: number;
	dayOfTheWeek: string;
};

export type Venue = {
	venueName: string;
	venueAddress: string;
	phone: string;
	mapEmbed?: {
		imageUrl: string;
		mainLink: string;
		roadsideLink: string;
		directionsLink: string;
		fullMapLink: string;
	};
};

export type Person = {
	name: string;
	bank?: {
		name: string;
		accountNumber: string;
		kakaoPayUrl?: string;
	};
};

export type CoupleEntity = {
	self: Person;
	father: Person;
	mother: Person;
};

export type TransportationOption = {
	type: "subway" | "bus" | "car";
};

export type Subway = {
	line: string;
	station: string;
	exit: string;
	walk: string;
};

export type Bus = {
	type: "간선버스" | "지선버스" | "광역버스";
	routes: string[];
	stop?: string;
};

export type Shuttle = {
	description: string;
};

export type ParkingLot = {
	name: string;
	address: string;
	nav?: {
		naver?: string;
		kakao?: string;
		tmap?: string;
	};
};

export type NavigationApp = {
	name: string;
	url: string;
};
