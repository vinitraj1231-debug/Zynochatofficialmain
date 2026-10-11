// server/server.js
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { verifyUserLocation, getSupportedCities } from './locationService.js';
import {
  getUserProfile,
  recordActivity,
  getLeaderboards,
  getRandomTriviaQuestion,
  submitTriviaAnswer
} from './gamificationService.js';
import {
  getAvailableRewards,
  processUpiRedemption,
  generateDailyRedeemCode,
  redeemCode
} from './rewardsService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

app.use(cors());
app.use(express.json());

// Serve static frontend assets from dist in production / static build
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.static(path.join(__dirname, '../dist')));

// REST API Endpoints

// Location Verification
app.post('/api/location/verify', (req, res) => {
  const { lat, lng, accuracy } = req.body;
  const result = verifyUserLocation(lat, lng, accuracy);
  res.json(result);
});

app.get('/api/location/cities', (req, res) => {
  res.json({ cities: getSupportedCities() });
});

// Gamification & Profile
app.get('/api/profile/:userId', (req, res) => {
  const { userId } = req.params;
  const { name, city } = req.query;
  const profile = getUserProfile(userId, name, city);
  res.json(profile);
});

app.post('/api/activity/streak', (req, res) => {
  const { userId } = req.body;
  const result = recordActivity(userId, 'DAILY_LOGIN');
  res.json(result);
});

app.get('/api/leaderboards', (req, res) => {
  res.json(getLeaderboards());
});

// Trivia Challenge
app.get('/api/trivia/question', (req, res) => {
  res.json(getRandomTriviaQuestion());
});

app.post('/api/trivia/answer', (req, res) => {
  const { userId, questionId, selectedIndex } = req.body;
  const result = submitTriviaAnswer(userId, questionId, selectedIndex);
  res.json(result);
});

// Rewards & UPI
app.get('/api/rewards', (req, res) => {
  res.json({ rewards: getAvailableRewards() });
});

app.post('/api/rewards/upi-claim', (req, res) => {
  const { userId, upiId, rewardId, points } = req.body;
  const result = processUpiRedemption(userId, upiId, rewardId, points);
  if (result.success) {
    // Deduct points in profile
    const profile = getUserProfile(userId);
    profile.points -= result.transaction.pointsDeducted;
    result.updatedPoints = profile.points;
  }
  res.json(result);
});

app.post('/api/rewards/generate-code', (req, res) => {
  const { userId } = req.body;
  res.json(generateDailyRedeemCode(userId));
});

app.post('/api/rewards/redeem-code', (req, res) => {
  const { userId, code, points } = req.body;
  const result = redeemCode(userId, code, points);
  if (result.success) {
    const profile = getUserProfile(userId);
    profile.points += result.pointsAwarded;
    result.updatedPoints = profile.points;
  }
  res.json(result);
});

// Socket.io Real-Time Messaging & Chat Backend
const chatRooms = {
  'Mumbai_general': [
    { id: '1', sender: 'Aarav (Mumbai)', text: 'Hey Mumbai! Ready for the Trivia challenge today? 🚀', time: '12:00 PM', city: 'Mumbai', channel: 'general' },
    { id: '2', sender: 'Ananya (Mumbai)', text: 'Yes! Need to hold our #1 rank on the national board! 🔥', time: '12:02 PM', city: 'Mumbai', channel: 'general' }
  ],
  'Bengaluru_general': [
    { id: '3', sender: 'Karthik (Bengaluru)', text: 'Bengaluru coders LFG for hackathon study group! 💻', time: '12:05 PM', city: 'Bengaluru', channel: 'study' }
  ]
};

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('join_room', ({ city, channel, user }) => {
    const roomKey = `${city}_${channel}`;
    socket.join(roomKey);
    socket.currentRoom = roomKey;
    socket.currentUser = user;

    // Send existing room messages
    if (!chatRooms[roomKey]) {
      chatRooms[roomKey] = [
        { id: Date.now().toString(), sender: 'ZynoBot 🤖', text: `Welcome to the ${city} #${channel} channel! CONNECT with your local squad!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), city, channel }
      ];
    }

    socket.emit('room_history', chatRooms[roomKey]);

    // Broadcast room participant count
    const count = io.sockets.adapter.rooms.get(roomKey)?.size || 1;
    io.to(roomKey).emit('room_stats', { userCount: count, roomKey });
  });

  socket.on('send_message', ({ city, channel, sender, text, userId }) => {
    const roomKey = `${city}_${channel}`;
    const messageObj = {
      id: Date.now().toString(),
      sender,
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      city,
      channel,
      userId
    };

    if (!chatRooms[roomKey]) chatRooms[roomKey] = [];
    chatRooms[roomKey].push(messageObj);

    // Award points for active messaging
    if (userId) {
      const { pointsAwarded, profile } = recordActivity(userId, 'MESSAGE_SENT', { city });
      socket.emit('points_updated', { pointsAwarded, profile });
    }

    io.to(roomKey).emit('new_message', messageObj);
  });

  socket.on('disconnect', () => {
    if (socket.currentRoom) {
      const count = io.sockets.adapter.rooms.get(socket.currentRoom)?.size || 0;
      io.to(socket.currentRoom).emit('room_stats', { userCount: count, roomKey: socket.currentRoom });
    }
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Zynochat backend server running on port ${PORT}`);
});
