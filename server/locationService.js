// Known city center coordinates for verification and spoof-prevention
export const CITIES = {
  'New York': { lat: 40.7128, lng: -74.0060, radiusKm: 50, region: 'East Coast' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, radiusKm: 60, region: 'West Coast' },
  'Chicago': { lat: 41.8781, lng: -87.6298, radiusKm: 45, region: 'Midwest' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, radiusKm: 40, region: 'South Asia' },
  'London': { lat: 51.5074, lng: -0.1278, radiusKm: 40, region: 'Europe' }
};

/**
 * Calculates Haversine distance between two sets of GPS coordinates in kilometers.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Checks if calculated distance is within the allowed radius.
 */
export function isWithinRadius(distanceKm, radiusKm = 50) {
  return distanceKm <= radiusKm;
}
