import type { WeddingDate, CoupleEntity, Venue } from "../types";

export const WEDDING_CONFIG: {
	weddingDate: WeddingDate;
	bride: CoupleEntity;
	groom: CoupleEntity;
	venue: Venue;
	invitationText: string;
	musicSrc: string;
} = {
	weddingDate: {
		year: 2026,
		month: 11,
		day: 21,
		hour: 12,
		minute: 0,
		dayOfTheWeek: '토요일',
	},
	bride: {
		self: {
			name: "변현진",
			bank: {
				name: "하나은행",
				accountNumber: "37391327334107",
				kakaoPayUrl: '',
			},
		},
		father: {
			name: "변희석",
			bank: {
				name: "SC제일은행",
				accountNumber: "157-20-199742",
			},
		},
		mother: {
			name: "최은정",
			bank: {
				name: "우리은행",
				accountNumber: "264-063081-02-001",
			},
		},
	},
	groom: {
		self: {
			name: "이도명",
			bank: {
				name: "하나은행",
				accountNumber: "19891031386507",
				kakaoPayUrl: '',
			},
		},
		father: {
			name: "이향만",
			bank: {
				name: "우리은행",
				accountNumber: "512-461925-02-001",
			},
		},
		mother: {
			name: "안순영",
			bank: {
				name: "우리은행",
				accountNumber: "1002-751-899437",
			},
		},
	},
	venue: {
		venueName: "세곡동 성당 대성전 3층",
		venueAddress: "서울 강남구 율현동 165-2",
		phone: "",
		// 카카오 로드맵(로드뷰) 데이터가 없어 mapEmbed 는 생략했습니다.
		// 지도를 붙이려면 카카오맵 > 공유 > 로드맵 만들기에서 값을 받아 채워주세요.
	},
	invitationText: "부족한 두 사람이 만나 사랑으로\n온전한 하나가 되려 합니다.\n\n한 자 한 자 용기 내어 써 내려갈\n이야기의 첫 줄,\n그 곁에 함께해 주세요.",
	musicSrc: `${import.meta.env.BASE_URL}assets/lenny-kravitz-it-aint-over-til-its-over.mp3`,
};

// English lettering from the original invitation cover.
export const WEDDING_COVER = {
	groomName: 'Domyoung Lee',
	brideName: 'Hyunjin Byun',
	venueLines: ['Segokdong', 'Catholic Church'],
};
