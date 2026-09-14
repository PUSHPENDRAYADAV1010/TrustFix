/**
 * Distance Calculation & Location Presets Utility for TrustFix
 * Implements the Haversine formula to compute great-circle distance between two points.
 */

export const DEFAULT_CUSTOMER_LOCATION = {
  name: 'Andheri West, Mumbai',
  city: 'Mumbai',
  latitude: 19.1136,
  longitude: 72.8697,
};

export const POPULAR_LOCATIONS = [
  { name: 'Andheri West, Mumbai', city: 'Mumbai', latitude: 19.1136, longitude: 72.8697 },
  { name: 'Bandra West, Mumbai', city: 'Mumbai', latitude: 19.0596, longitude: 72.8295 },
  { name: 'Powai, Mumbai', city: 'Mumbai', latitude: 19.1197, longitude: 72.9051 },
  { name: 'Thane West', city: 'Thane', latitude: 19.2183, longitude: 72.9781 },
  { name: 'Vashi, Navi Mumbai', city: 'Navi Mumbai', latitude: 19.0760, longitude: 72.9981 },
  { name: 'Borivali West, Mumbai', city: 'Mumbai', latitude: 19.2307, longitude: 72.8567 },
  { name: 'Dadar, Mumbai', city: 'Mumbai', latitude: 19.0178, longitude: 72.8478 },
  { name: 'Kharghar, Navi Mumbai', city: 'Navi Mumbai', latitude: 19.0434, longitude: 73.0673 },
];

/**
 * Calculates distance in kilometers between two lat/lng coordinates using the Haversine formula.
 * @param {number} lat1
 * @param {number} lon1
 * @param {number} lat2
 * @param {number} lon2
 * @returns {number} distance in kilometers (rounded to 1 decimal place)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;

  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth's radius in kilometers

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;

  return Math.round(d * 10) / 10;
};

/**
 * Formats a distance in kilometers to a user-friendly string.
 * @param {number|null} distanceKm
 * @returns {string} e.g. "2.4 km away"
 */
export const formatDistance = (distanceKm) => {
  if (distanceKm === null || distanceKm === undefined) return '';
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m away`;
  }
  return `${distanceKm} km away`;
};
