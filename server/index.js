import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { calculateDistance, isWithinRadius, CITIES } from './locationService.js';
import { userStore, addActivityPoints, recordLoginStreak, getLeaderboards, redeemCode } from './gamificationService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static frontend build if present
app.use(express.static(path.join(__dirname, '../dist')));

// In-memory chat storage by city and channel
const chatHistory = {
  'New York': {
    'general': [],
    'gaming': [],
    'study': [],
    'events': []
  },
  'Los Angeles': {
    'general': [],
    'gaming': [],
    'study': [],
    'events': []
  },
  'Chicago': {
    'general': [],
    'gaming': [],
    'study': [],
    'events': []
  },
  'Mumbai': {
    'general': [],
    'gaming': [],
    'study': [],
    'events': []
  },
  'London': {
    'general': [],
    'gaming': [],
    'study': [],
    'events': []
  }
};

// API Endpoints
app.get('/api/cities', (req, res) => {
  res.json({ cities: CITIES });
});

app.post('/api/verify-location', (req, res) => {
  const { userId, targetCity, latitude, longitude } = req.body;
  if (!targetCity || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ error: 'Missing location parameters' });
  }

  const cityData = CITIES[targetCity];
  if (!cityData) {
    return res.status(400).json({ error: 'Invalid city specified' });
  }

  const distance = calculateDistance(latitude, longitude, cityData.lat, cityData.lng);
  const isValid = isWithinRadius(distance, cityData.radiusKm || 50);

  if (userId && userStore[userId]) {
    userStore[userId].verifiedCity = isValid ? targetCity : null;
    userStore[userId].locationVerified = isValid;
    userStore[userId].verifiedDistanceKm = Math.round(distance * 10) / 10;
    if (isValid) {
      addActivityPoints(userId, 'location_verify');
    }
  }

  res.json({
    verified: isValid,
    distanceKm: Math.round(distance * 10) / 10,
    maxRadiusKm: cityData.radiusKm || 50,
    targetCity
  });
});

app.get('/api/leaderboard', (req, res) => {
  const { city } = req.query;
  const leaderboards = getLeaderboards(city);
  res.json(leaderboards);
});

app.post('/api/user/login', (req, res) => {
  const { username, city = 'New York' } = req.body;
  if (!username) {
    return res.status(400).json({ error: 'Username is required' });
  }

  // Find or create user
  let userId = Object.keys(userStore).find(id => userStore[id].username.toLowerCase() === username.toLowerCase());

  if (!userId) {
    userId = 'usr_' + Math.random().toString(36).substr(2, 9);
    userStore[userId] = {
      id: userId,
      username,
      city,
      points: 100,
      streakDays: 1,
      lastLoginDate: new Date().toISOString(),
      locationVerified: false,
      badges: ['Newcomer'],
      crownLevel: 'Bronze'
    };
  }

  const streakResult = recordLoginStreak(userId);

  res.json({
    user: userStore[userId],
    streakUpdated: streakResult.streakIncremented
  });
});

app.post('/api/redeem', (req, res) => {
  const { userId, code } = req.body;
  if (!userId || !code) {
    return res.status(400).json({ error: 'User ID and code are required' });
  }

  const result = redeemCode(userId, code);
  res.json(result);
});

// Socket.io Real-time Event Handlers
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('join_channel', ({ city, channel, userId, username }) => {
    // Leave previous rooms
    Array.from(socket.rooms).forEach(room => {
      if (room !== socket.id) {
        socket.leave(room);
      }
    });

    const roomName = `${city}:${channel}`;
    socket.join(roomName);
    socket.userData = { userId, username, city, channel };

    if (!chatHistory[city]) {
      chatHistory[city] = { general: [], gaming: [], study: [], events: [] };
    }
    if (!chatHistory[city][channel]) {
      chatHistory[city][channel] = [];
    }

    // Send history to joining client
    socket.emit('chat_history', chatHistory[city][channel] || []);

    // Broadcast system message
    io.to(roomName).emit('system_message', {
      id: 'sys_' + Date.now(),
      text: `${username || 'A user'} joined the #${channel} channel in ${city}!`,
      timestamp: new Date().toISOString()
    });
  });

  socket.on('send_message', ({ city, channel, userId, username, text }) => {
    if (!text || !text.trim()) return;

    const roomName = `${city}:${channel}`;

    // Add points for active chatting
    let pointsEarned = 0;
    if (userId && userStore[userId]) {
      pointsEarned = addActivityPoints(userId, 'chat_message');
    }

    const message = {
      id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      userId,
      username: username || 'Anonymous',
      text: text.trim(),
      city,
      channel,
      timestamp: new Date().toISOString(),
      userPoints: userStore[userId]?.points || 0,
      userVerified: userStore[userId]?.locationVerified || false
    };

    if (!chatHistory[city]) chatHistory[city] = { general: [], gaming: [], study: [], events: [] };
    if (!chatHistory[city][channel]) chatHistory[city][channel] = [];

    chatHistory[city][channel].push(message);
    if (chatHistory[city][channel].length > 100) {
      chatHistory[city][channel].shift();
    }

    io.to(roomName).emit('receive_message', message);

    if (pointsEarned > 0) {
      socket.emit('points_updated', {
        userId,
        points: userStore[userId].points,
        earned: pointsEarned,
        reason: 'Active Chatting'
      });
    }
  });

  socket.on('submit_trivia_answer', ({ userId, isCorrect, pointsAwarded }) => {
    if (userId && userStore[userId] && isCorrect) {
      userStore[userId].points += pointsAwarded;
      if (!userStore[userId].badges.includes('Trivia Master') && userStore[userId].points >= 250) {
        userStore[userId].badges.push('Trivia Master');
      }
      socket.emit('points_updated', {
        userId,
        points: userStore[userId].points,
        earned: pointsAwarded,
        reason: 'Trivia Victory'
      });
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Fallback to index.html for SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../dist/index.html'));
});

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Zynochat backend running on port ${PORT}`);
});

export { app, httpServer };
