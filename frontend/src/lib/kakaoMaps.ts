type Coordinates = {
  latitude: number | null;
  longitude: number | null;
};

let kakaoMapsReadyPromise: Promise<any> | null = null;

export function loadKakaoMapsSdk() {
  if (kakaoMapsReadyPromise) {
    return kakaoMapsReadyPromise;
  }

  kakaoMapsReadyPromise = new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(new Error("Window is not available."));
      return;
    }

    const finishLoading = () => {
      const kakao = (window as any).kakao;

      if (!kakao?.maps?.load) {
        reject(new Error("Kakao Maps SDK did not initialize correctly."));
        return;
      }

      kakao.maps.load(() => resolve(kakao));
    };

    const existingKakao = (window as any).kakao;
    if (existingKakao?.maps?.load) {
      finishLoading();
      return;
    }

    const script = document.querySelector<HTMLScriptElement>(
      'script[src*="dapi.kakao.com/v2/maps/sdk.js"]'
    );

    if (!script) {
      reject(new Error("Kakao Maps SDK script tag was not found."));
      return;
    }

    script.addEventListener("load", finishLoading, { once: true });
    script.addEventListener(
      "error",
      () => reject(new Error("Failed to load Kakao Maps SDK.")),
      { once: true }
    );
  });

  return kakaoMapsReadyPromise;
}

async function geocodeAddress(address: string): Promise<Coordinates | null> {
  const trimmedAddress = address.trim();
  if (!trimmedAddress) {
    return null;
  }

  const kakao = await loadKakaoMapsSdk();
  const services = kakao?.maps?.services;

  if (!services?.Geocoder || !services?.Status) {
    throw new Error("Kakao geocoder service is not available.");
  }

  return new Promise((resolve, reject) => {
    const geocoder = new services.Geocoder();

    geocoder.addressSearch(trimmedAddress, (result: any[], status: string) => {
      if (status === services.Status.OK && result.length > 0) {
        resolve({
          latitude: Number(result[0].y),
          longitude: Number(result[0].x),
        });
        return;
      }

      if (status === services.Status.ZERO_RESULT) {
        resolve(null);
        return;
      }

      reject(new Error(`Kakao geocoder request failed for "${trimmedAddress}".`));
    });
  });
}

function buildAddressCandidates(address: string, district: string) {
  const trimmedAddress = address.trim();
  const trimmedDistrict = district.trim();
  const candidates = new Set<string>();

  if (trimmedAddress) {
    candidates.add(trimmedAddress);
    candidates.add(`${trimmedAddress}, Seoul`);

    if (
      trimmedDistrict &&
      !trimmedAddress.toLowerCase().includes(trimmedDistrict.toLowerCase())
    ) {
      candidates.add(`${trimmedAddress}, ${trimmedDistrict}, Seoul`);
      candidates.add(`${trimmedDistrict}, ${trimmedAddress}, Seoul`);
    }
  }

  if (trimmedDistrict) {
    candidates.add(`${trimmedDistrict}, Seoul`);
  }

  return Array.from(candidates).filter(Boolean);
}

export async function resolveListingCoordinates(options: {
  address: string;
  district: string;
  fallbackLatitude: number | null;
  fallbackLongitude: number | null;
}): Promise<Coordinates> {
  const { address, district, fallbackLatitude, fallbackLongitude } = options;

  for (const candidate of buildAddressCandidates(address, district)) {
    try {
      const coordinates = await geocodeAddress(candidate);
      if (coordinates) {
        return coordinates;
      }
    } catch (error) {
      console.warn("Failed to geocode address candidate:", candidate, error);
    }
  }

  return {
    latitude: fallbackLatitude,
    longitude: fallbackLongitude,
  };
}
