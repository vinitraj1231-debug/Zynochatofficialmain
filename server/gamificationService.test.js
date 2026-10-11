import test from 'node:test';
import assert from 'node:assert/strict';
import { userStore, addActivityPoints, recordLoginStreak, getLeaderboards, redeemCode } from './gamificationService.js';

test('Gamification Engine - Points & Streaks Logic', () => {
  const initialUser = userStore['usr_1'];
  const initialPoints = initialUser.points;

  // Add points for chat message
  const earned = addActivityPoints('usr_1', 'chat_message');
  assert.equal(earned, 5);
  assert.equal(userStore['usr_1'].points, initialPoints + 5);

  // Redeem promo code
  const redeemResult = redeemCode('usr_1', 'ZYNOFREE50');
  assert.equal(redeemResult.success, true);
  assert.equal(userStore['usr_1'].points, initialPoints + 5 + 50);

  // Leaderboard retrieval
  const leaderboards = getLeaderboards('New York');
  assert.ok(leaderboards.cityLeaderboard.length > 0);
  assert.ok(leaderboards.nationalLeaderboard.length >= leaderboards.cityLeaderboard.length);
  assert.ok(leaderboards.nationalLeaderboard[0].points >= leaderboards.nationalLeaderboard[1].points);
});
