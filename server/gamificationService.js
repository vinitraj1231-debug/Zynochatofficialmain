// In-memory store for MVP demo
export const userStore = {
  'usr_1': {
    id: 'usr_1',
    username: 'AlexRider',
    city: 'New York',
    points: 450,
    streakDays: 7,
    lastLoginDate: new Date().toISOString(),
    locationVerified: true,
    verifiedCity: 'New York',
    verifiedDistanceKm: 3.2,
    badges: ['Daily Champion', 'Verified Local', 'Trivia Master'],
    crownLevel: 'Gold'
  },
  'usr_2': {
    id: 'usr_2',
    username: 'CyberSam',
    city: 'New York',
    points: 380,
    streakDays: 5,
    lastLoginDate: new Date().toISOString(),
    locationVerified: true,
    verifiedCity: 'New York',
    verifiedDistanceKm: 12.5,
    badges: ['Night Owl', 'Verified Local'],
    crownLevel: 'Silver'
  },
  'usr_3': {
    id: 'usr_3',
    username: 'Maya_Gamer',
    city: 'Los Angeles',
    points: 520,
    streakDays: 12,
    lastLoginDate: new Date().toISOString(),
    locationVerified: true,
    verifiedCity: 'Los Angeles',
    verifiedDistanceKm: 5.1,
    badges: ['Local Legend', 'Top Contributor'],
    crownLevel: 'Gold'
  },
  'usr_4': {
    id: 'usr_4',
    username: 'DevJohn',
    city: 'London',
    points: 290,
    streakDays: 3,
    lastLoginDate: new Date().toISOString(),
    locationVerified: false,
    badges: ['Newcomer'],
    crownLevel: 'Bronze'
  }
};

export const redeemableCodes = {
  'ZYNOFREE50': { points: 50, title: '$5 Local Cafe Voucher', active: true },
  'CONQUER2025': { points: 100, title: 'Exclusive Gold Crown Effect', active: true },
  'LOCALCHAMP': { points: 75, title: 'Local Event Priority Pass', active: true }
};

export function addActivityPoints(userId, actionType) {
  const user = userStore[userId];
  if (!user) return 0;

  let pointsEarned = 0;
  switch (actionType) {
    case 'chat_message':
      pointsEarned = 5;
      break;
    case 'location_verify':
      pointsEarned = 50;
      if (!user.badges.includes('Verified Local')) {
        user.badges.push('Verified Local');
      }
      break;
    case 'daily_login':
      pointsEarned = 20;
      break;
    default:
      pointsEarned = 2;
  }

  user.points += pointsEarned;

  // Update crown level based on points
  if (user.points >= 500) {
    user.crownLevel = 'Platinum';
  } else if (user.points >= 350) {
    user.crownLevel = 'Gold';
  } else if (user.points >= 200) {
    user.crownLevel = 'Silver';
  } else {
    user.crownLevel = 'Bronze';
  }

  return pointsEarned;
}

export function recordLoginStreak(userId) {
  const user = userStore[userId];
  if (!user) return { streakIncremented: false, streakDays: 0 };

  const lastLogin = new Date(user.lastLoginDate);
  const now = new Date();

  const diffDays = Math.floor((now - lastLogin) / (1000 * 60 * 60 * 24));

  let streakIncremented = false;
  if (diffDays === 1) {
    user.streakDays += 1;
    streakIncremented = true;
    addActivityPoints(userId, 'daily_login');
  } else if (diffDays > 1) {
    user.streakDays = 1;
  }

  user.lastLoginDate = now.toISOString();

  return {
    streakIncremented,
    streakDays: user.streakDays
  };
}

export function getLeaderboards(userCity = null) {
  const users = Object.values(userStore);

  const national = [...users].sort((a, b) => b.points - a.points);

  const city = userCity
    ? users.filter(u => u.city.toLowerCase() === userCity.toLowerCase()).sort((a, b) => b.points - a.points)
    : national;

  return {
    cityLeaderboard: city,
    nationalLeaderboard: national
  };
}

export function redeemCode(userId, code) {
  const user = userStore[userId];
  if (!user) {
    return { success: false, message: 'User not found' };
  }

  const promo = redeemableCodes[code.toUpperCase()];
  if (!promo) {
    return { success: false, message: 'Invalid redeem code' };
  }

  if (!promo.active) {
    return { success: false, message: 'Code has already been redeemed or expired' };
  }

  user.points += promo.points;
  return {
    success: true,
    message: `Redeemed successfully! Received ${promo.title} (+${promo.points} pts)`,
    newTotalPoints: user.points,
    reward: promo.title
  };
}
