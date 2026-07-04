/** Geographic limits for Cambodia — tiles and panning stay inside this box. */
export const CAMBODIA_BOUNDS = {
  south: 10.35,
  west: 102.3,
  north: 14.75,
  east: 107.65,
};

/** Phnom Penh — default map center when no trail data exists. */
export const CAMBODIA_CENTER = {
  latitude: 12.5657,
  longitude: 104.991,
};

/** Leaflet: [[south, west], [north, east]] */
export const CAMBODIA_LEAFLET_BOUNDS = [
  [CAMBODIA_BOUNDS.south, CAMBODIA_BOUNDS.west],
  [CAMBODIA_BOUNDS.north, CAMBODIA_BOUNDS.east],
];

/** Default zoom levels — lower min zoom = fewer tiles at country scale. */
export const CAMBODIA_MIN_ZOOM = 7;
export const CAMBODIA_MAX_ZOOM = 16;

export const CAMBODIA_DEFAULT_REGION = {
  latitude: CAMBODIA_CENTER.latitude,
  longitude: CAMBODIA_CENTER.longitude,
  latitudeDelta: 4.4,
  longitudeDelta: 5.35,
};

export function clampToCambodia(region) {
  const halfLat = region.latitudeDelta / 2;
  const halfLng = region.longitudeDelta / 2;

  let { latitude, longitude, latitudeDelta, longitudeDelta } = region;

  latitudeDelta = Math.min(latitudeDelta, CAMBODIA_BOUNDS.north - CAMBODIA_BOUNDS.south);
  longitudeDelta = Math.min(longitudeDelta, CAMBODIA_BOUNDS.east - CAMBODIA_BOUNDS.west);

  const minLat = CAMBODIA_BOUNDS.south + halfLat;
  const maxLat = CAMBODIA_BOUNDS.north - halfLat;
  const minLng = CAMBODIA_BOUNDS.west + halfLng;
  const maxLng = CAMBODIA_BOUNDS.east - halfLng;

  return {
    latitude: Math.min(maxLat, Math.max(minLat, latitude)),
    longitude: Math.min(maxLng, Math.max(minLng, longitude)),
    latitudeDelta,
    longitudeDelta,
  };
}

export function isInsideCambodia(lat, lng) {
  return (
    lat >= CAMBODIA_BOUNDS.south &&
    lat <= CAMBODIA_BOUNDS.north &&
    lng >= CAMBODIA_BOUNDS.west &&
    lng <= CAMBODIA_BOUNDS.east
  );
}
