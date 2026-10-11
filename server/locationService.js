// server/locationService.js

// Known Cities in Target Region (India/Global hyper-local)
export const CITIES = [
  { name: 'Mumbai', lat: 19.0760, lng: 72.8777, region: 'Maharashtra' },
  { name: 'Delhi', lat: 28.6139, lng: 77.2090, region: 'Delhi NCR' },
  { name: 'Bengaluru', lat: 12.9716, lng: 77.5946, region: 'Karnataka' },
  { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, region: 'Telangana' },
  { name: 'Chennai', lat: 13.0827, lng: 80.2707, region: 'Tamil Nadu' },
  { name: 'Kolkata', lat: 22.5726, lng: 88.3639, region: 'West Bengal' },
  { name: 'Pune', lat: 18.5204, lng: 73.8567, region: 'Maharashtra' },
  { name: 'Ahmedabad', lat: 23.0225, lng: 72.5714, region: 'Gujarat' },
];

/**
 * Calculates Haversine distance between two sets of GPS coordinates in kilometers.
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of Earth in kilometers
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Verifies coordinates and matches closest verified city.
 * Anti-spoof check ensures reported accuracy and coordinate validity.
 */
export function verifyUserLocation(lat, lng, accuracy = 20) {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) {
    return { verified: false, error: 'Invalid coordinates provided' };
  }

  // Anti-spoof check: accuracy greater than 1000m or out-of-bound coords
  if (accuracy > 1000) {
    return { verified: false, error: 'Location signal accuracy too low (possible spoofing)' };
  }

  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return { verified: false, error: 'Coordinates out of physical bounds' };
  }

  // Find nearest city
  let closestCity = CITIES[0];
  let minDistance = Infinity;

  for (const city of CITIES) {
    const dist = calculateDistance(lat, lng, city.lat, city.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestCity = city;
    }
  }

  return {
    verified: true,
    city: closestCity.name,
    region: closestCity.region,
    distanceToCenterKm: Math.round(minDistance * 10) / 10,
    timestamp: new Date().toISOString()
  };
}

export function getSupportedCities() {
  return CITIES;
}
