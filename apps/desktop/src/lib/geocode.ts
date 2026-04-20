/**
 * Nominatim (OpenStreetMap) forward geocoding — Philippines bias, no API key.
 * @see https://operations.osmfoundation.org/policies/nominatim/
 */

const NOMINATIM_SEARCH =
  "https://nominatim.openstreetmap.org/search" as const;

/** Contact email for Nominatim fair-use identification (replace with a real project contact in production). */
const NOMINATIM_EMAIL = "aegis@example.com";

export interface GeocodeResult {
  id: string;
  displayName: string;
  shortLabel: string;
  lat: number;
  lng: number;
  type: string;
}

interface NominatimItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  type: string;
  addresstype?: string;
  name?: string;
  address?: Record<string, string>;
}

function shortLabelFromItem(item: NominatimItem): string {
  const a = item.address;
  if (a) {
    const parts = [
      a.amenity || a.building,
      a.road,
      a.village || a.town || a.city || a.municipality,
      a.state || a.region,
    ].filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  const first = item.display_name.split(",").map((s) => s.trim())[0];
  return first || item.display_name;
}

function mapItem(item: NominatimItem): GeocodeResult | null {
  const lat = parseFloat(item.lat);
  const lng = parseFloat(item.lon);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return {
    id: String(item.place_id),
    displayName: item.display_name,
    shortLabel: item.name || shortLabelFromItem(item),
    lat,
    lng,
    type: item.addresstype || item.type,
  };
}

/**
 * Search addresses in the Philippines. Debounce at the call site (>= 3 chars recommended).
 */
export async function searchAddresses(
  query: string,
  signal?: AbortSignal
): Promise<GeocodeResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const params = new URLSearchParams({
    format: "jsonv2",
    addressdetails: "1",
    limit: "5",
    countrycodes: "ph",
    q,
    email: NOMINATIM_EMAIL,
  });

  const res = await fetch(`${NOMINATIM_SEARCH}?${params}`, {
    signal,
    headers: {
      Accept: "application/json",
      "Accept-Language": "en",
    },
  });

  if (!res.ok) {
    throw new Error(`Geocode ${res.status}: ${res.statusText}`);
  }

  const data = (await res.json()) as NominatimItem[];
  if (!Array.isArray(data)) return [];

  const out: GeocodeResult[] = [];
  for (const item of data) {
    const mapped = mapItem(item);
    if (mapped) out.push(mapped);
  }
  return out;
}
