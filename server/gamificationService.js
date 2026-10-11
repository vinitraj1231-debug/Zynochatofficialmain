// server/gamificationService.js

const userProfiles = new Map();

// Default Mock City Leaderboard Data
const cityLeaderboards = {
  Mumbai: { city: 'Mumbai', totalPoints: 12450, activeUsers: 340, rank: 1 },
  Bengaluru: { city: 'Bengaluru', totalPoints: 11200, activeUsers: 290, rank: 2 },
  Delhi: { city: 'Delhi', totalPoints: 9800, activeUsers: 260, rank: 3 },
  Hyderabad: { city: 'Hyderabad', totalPoints: 7500, activeUsers: 190, rank: 4 },
  Pune: { city: 'Pune', totalPoints: 6200, activeUsers: 150, rank: 5 },
  Chennai: { city: 'Chennai', totalPoints: 5400, activeUsers: 130, rank: 6 },
  Kolkata: { city: 'Kolkata', totalPoints: 4800, activeUsers: 110, rank: 7 },
  Ahmedabad: { city: 'Ahmedabad', totalPoints: 3900, activeUsers: 95, rank: 8 },
};

const triviaQuestions = [
  {
    id: 1,
    question: "Which city is known as the 'Silicon Valley of India'?",
    options: ["Mumbai", "Bengaluru", "Hyderabad", "Delhi"],
    correctIndex: 1,
    category: "City Trivia",
    points: 50
  },
  {
    id: 2,
    question: "What is the tagline of Zynochat?",
    options: ["CHAT • PLAY • WIN", "CONNECT • COMPETE • CONQUER", "SHARE • SHINE • SUCCEED", "LOCAL • LIVE • LEAD"],
    correctIndex: 1,
    category: "Zyno Ecosystem",
    points: 50
  },
  {
    id: 3,
    question: "In Zynochat logo, what symbol sits at the peak of the upward swoosh?",
    options: ["Crown", "Glowing Star", "Lightning Bolt", "Chat Bubble"],
    correctIndex: 1,
    category: "Brand Trivia",
    points: 50
  },
  {
    id: 4,
    question: "Which monument is located in Gateway of India's city Mumbai?",
    options: ["Gateway of India", "Charminar", "Victoria Memorial", "Qutub Minar"],
    correctIndex: 0,
    category: "Culture",
    points: 50
  },
  {
    id: 5,
    question: "What real-time protocol powers Zynochat's near-zero lag messaging?",
    options: ["HTTP Long Polling", "WebSockets / Socket.io", "FTP", "REST Polling"],
    correctIndex: 1,
    category: "Tech",
    points: 50
  }
];

export function getUserProfile(userId, name = 'ZynoUser', city = 'Mumbai') {
  if (!userProfiles.has(userId)) {
    userProfiles.set(userId, {
      userId,
      name,
      city,
      points: 250,
      streakDays: 3,
      lastLoginDate: new Date().toISOString().split('T')[0],
      badges: ['Local Pioneer 🌟', 'Chat Starter 💬'],
      crown: 'City Challenger 👑',
      isVerified: true
    });
  }
  return userProfiles.get(userId);
}

export function recordActivity(userId, activityType, extraData = {}) {
  const profile = getUserProfile(userId, extraData.name, extraData.city);
  let pointsAwarded = 0;

  if (activityType === 'MESSAGE_SENT') {
    pointsAwarded = 10;
  } else if (activityType === 'DAILY_LOGIN') {
    const today = new Date().toISOString().split('T')[0];
    if (profile.lastLoginDate !== today) {
      profile.streakDays += 1;
      profile.lastLoginDate = today;
      pointsAwarded = 50 + (profile.streakDays * 5); // streak bonus
    }
  } else if (activityType === 'TRIVIA_CORRECT') {
    pointsAwarded = extraData.points || 50;
  } else if (activityType === 'MINI_GAME_WIN') {
    pointsAwarded = extraData.score || 100;
  }

  profile.points += pointsAwarded;

  // Award badges based on milestones
  if (profile.streakDays >= 7 && !profile.badges.includes('Streak Master 🔥')) {
    profile.badges.push('Streak Master 🔥');
  }
  if (profile.points >= 500 && !profile.badges.includes('Rising Star ⭐')) {
    profile.badges.push('Rising Star ⭐');
    profile.crown = 'Regional Champion 👑';
  }
  if (profile.points >= 1000 && !profile.badges.includes('Conqueror 🏆')) {
    profile.badges.push('Conqueror 🏆');
    profile.crown = 'National Conqueror 👑✨';
  }

  // Update city leaderboard score
  if (cityLeaderboards[profile.city]) {
    cityLeaderboards[profile.city].totalPoints += pointsAwarded;
  }

  return { profile, pointsAwarded };
}

export function getLeaderboards() {
  const nationalUsers = Array.from(userProfiles.values())
    .sort((a, b) => b.points - a.points)
    .slice(0, 10);

  const sortedCities = Object.values(cityLeaderboards)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((c, idx) => ({ ...c, rank: idx + 1 }));

  return {
    cities: sortedCities,
    nationalUsers
  };
}

export function getRandomTriviaQuestion() {
  const randomIndex = Math.floor(Math.random() * triviaQuestions.length);
  return triviaQuestions[randomIndex];
}

export function submitTriviaAnswer(userId, questionId, selectedIndex) {
  const question = triviaQuestions.find(q => q.id === questionId);
  if (!question) return { correct: false, error: 'Question not found' };

  const isCorrect = question.correctIndex === selectedIndex;
  let result = { correct: isCorrect, correctAnswerIndex: question.correctIndex, pointsAwarded: 0 };

  if (isCorrect) {
    const activity = recordActivity(userId, 'TRIVIA_CORRECT', { points: question.points });
    result.pointsAwarded = question.points;
    result.updatedProfile = activity.profile;
  } else {
    result.updatedProfile = getUserProfile(userId);
  }

  return result;
}
