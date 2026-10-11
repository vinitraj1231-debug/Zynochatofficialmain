import test from 'node:test';
import assert from 'node:assert/strict';
import { app, httpServer } from './index.js';
import { CITIES, calculateDistance } from './locationService.js';
import { userStore, addActivityPoints, redeemCode } from './gamificationService.js';

test('Integration Test - Express API Endpoints & Logic', async (t) => {

  await t.test('GET /api/cities should return supported cities list', async () => {
    const citiesList = Object.keys(CITIES);
    assert.ok(citiesList.includes('New York'));
    assert.ok(citiesList.includes('Los Angeles'));
  });

  await t.test('POST /api/verify-location should verify within radius', async () => {
    // Coords near NYC
    const nyc = CITIES['New York'];
    const dist = calculateDistance(nyc.lat, nyc.lng, nyc.lat + 0.01, nyc.lng + 0.01);
    assert.ok(dist < 10);
  });

  await t.test('Gamification Points Accrual & Redemption', async () => {
    const testUserId = 'usr_test_integration';
    userStore[testUserId] = {
      id: testUserId,
      username: 'Tester',
      city: 'Chicago',
      points: 100,
      streakDays: 2,
      lastLoginDate: new Date().toISOString(),
      locationVerified: false,
      badges: [],
      crownLevel: 'Bronze'
    };

    const earnedMsg = addActivityPoints(testUserId, 'chat_message');
    assert.equal(earnedMsg, 5);
    assert.equal(userStore[testUserId].points, 105);

    const redeemRes = redeemCode(testUserId, 'LOCALCHAMP');
    assert.equal(redeemRes.success, true);
    assert.equal(userStore[testUserId].points, 180);
  });

  // Close HTTP server cleanly
  httpServer.close();
});
