import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDistance, isWithinRadius, CITIES } from './locationService.js';

test('Location Verification - Distance Calculation (Haversine)', () => {
  const nyc = CITIES['New York'];

  // Distance from exact NYC coords should be 0
  const distZero = calculateDistance(nyc.lat, nyc.lng, nyc.lat, nyc.lng);
  assert.equal(Math.round(distZero), 0);

  // Distance from NYC to nearby point (~10 km away)
  const nearbyLat = nyc.lat + 0.08;
  const nearbyLng = nyc.lng + 0.08;
  const distNearby = calculateDistance(nyc.lat, nyc.lng, nearbyLat, nearbyLng);
  assert.ok(distNearby > 5 && distNearby < 20);

  // Verification within 50 km radius
  assert.equal(isWithinRadius(distNearby, 50), true);
  assert.equal(isWithinRadius(120, 50), false);
});
