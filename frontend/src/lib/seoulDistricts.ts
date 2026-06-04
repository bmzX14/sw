export type SeoulDistrict = {
  name: string;
  lat: number;
  lng: number;
};

export const SEOUL_DISTRICTS: SeoulDistrict[] = [
  { name: "Gangnam-gu", lat: 37.5172, lng: 127.0473 },
  { name: "Gangdong-gu", lat: 37.5301, lng: 127.1238 },
  { name: "Gangbuk-gu", lat: 37.6396, lng: 127.0253 },
  { name: "Gangseo-gu", lat: 37.5509, lng: 126.8495 },
  { name: "Gwanak-gu", lat: 37.4784, lng: 126.9516 },
  { name: "Gwangjin-gu", lat: 37.5384, lng: 127.0822 },
  { name: "Guro-gu", lat: 37.4954, lng: 126.8874 },
  { name: "Geumcheon-gu", lat: 37.46, lng: 126.9002 },
  { name: "Nowon-gu", lat: 37.6542, lng: 127.0568 },
  { name: "Dobong-gu", lat: 37.6688, lng: 127.0471 },
  { name: "Dongdaemun-gu", lat: 37.5744, lng: 127.0396 },
  { name: "Dongjak-gu", lat: 37.5124, lng: 126.9393 },
  { name: "Mapo-gu", lat: 37.5663, lng: 126.9014 },
  { name: "Seodaemun-gu", lat: 37.5791, lng: 126.9368 },
  { name: "Seocho-gu", lat: 37.4836, lng: 127.0327 },
  { name: "Seongdong-gu", lat: 37.5633, lng: 127.0369 },
  { name: "Seongbuk-gu", lat: 37.5894, lng: 127.0167 },
  { name: "Songpa-gu", lat: 37.5145, lng: 127.1059 },
  { name: "Yangcheon-gu", lat: 37.527, lng: 126.8561 },
  { name: "Yeongdeungpo-gu", lat: 37.5263, lng: 126.8963 },
  { name: "Yongsan-gu", lat: 37.5326, lng: 126.9905 },
  { name: "Eunpyeong-gu", lat: 37.6027, lng: 126.9291 },
  { name: "Jongno-gu", lat: 37.5735, lng: 126.979 },
  { name: "Jung-gu", lat: 37.564, lng: 126.9975 },
  { name: "Jungnang-gu", lat: 37.6063, lng: 127.0928 },
];

const DISTRICT_ALIASES: Record<string, string> = {
  "gangnam-gu": "Gangnam-gu",
  "gangdong-gu": "Gangdong-gu",
  "gangbuk-gu": "Gangbuk-gu",
  "gangseo-gu": "Gangseo-gu",
  "gwanak-gu": "Gwanak-gu",
  "gwangjin-gu": "Gwangjin-gu",
  "guro-gu": "Guro-gu",
  "geumcheon-gu": "Geumcheon-gu",
  "nowon-gu": "Nowon-gu",
  "dobong-gu": "Dobong-gu",
  "dongdaemun-gu": "Dongdaemun-gu",
  "dongjak-gu": "Dongjak-gu",
  "mapo-gu": "Mapo-gu",
  "seodaemun-gu": "Seodaemun-gu",
  "seodeamun-gu": "Seodaemun-gu",
  "seocho-gu": "Seocho-gu",
  "seongdong-gu": "Seongdong-gu",
  "seongbuk-gu": "Seongbuk-gu",
  "songpa-gu": "Songpa-gu",
  "yangcheon-gu": "Yangcheon-gu",
  "yeongdeungpo-gu": "Yeongdeungpo-gu",
  "yongsan-gu": "Yongsan-gu",
  "eunpyeong-gu": "Eunpyeong-gu",
  "jongno-gu": "Jongno-gu",
  "jung-gu": "Jung-gu",
  "jungnang-gu": "Jungnang-gu",
  "강남구": "Gangnam-gu",
  "강동구": "Gangdong-gu",
  "강북구": "Gangbuk-gu",
  "강서구": "Gangseo-gu",
  "관악구": "Gwanak-gu",
  "광진구": "Gwangjin-gu",
  "구로구": "Guro-gu",
  "금천구": "Geumcheon-gu",
  "노원구": "Nowon-gu",
  "도봉구": "Dobong-gu",
  "동대문구": "Dongdaemun-gu",
  "동작구": "Dongjak-gu",
  "마포구": "Mapo-gu",
  "서대문구": "Seodaemun-gu",
  "서초구": "Seocho-gu",
  "성동구": "Seongdong-gu",
  "성북구": "Seongbuk-gu",
  "송파구": "Songpa-gu",
  "양천구": "Yangcheon-gu",
  "영등포구": "Yeongdeungpo-gu",
  "용산구": "Yongsan-gu",
  "은평구": "Eunpyeong-gu",
  "종로구": "Jongno-gu",
  "중구": "Jung-gu",
  "중랑구": "Jungnang-gu",
};

export function normalizeSeoulDistrict(...values: Array<string | null | undefined>): string {
  for (const value of values) {
    const trimmed = value?.trim();
    if (!trimmed) continue;

    const directMatch = DISTRICT_ALIASES[trimmed.toLowerCase()] || DISTRICT_ALIASES[trimmed];
    if (directMatch) {
      return directMatch;
    }

    const lowerValue = trimmed.toLowerCase();
    for (const [alias, canonical] of Object.entries(DISTRICT_ALIASES)) {
      if (trimmed.includes(alias) || lowerValue.includes(alias.toLowerCase())) {
        return canonical;
      }
    }
  }

  return values.find((value): value is string => Boolean(value?.trim()))?.trim() || "";
}
