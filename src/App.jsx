import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import Header from './components/Header';
import ChatRoom from './components/ChatRoom';
import Leaderboard from './components/Leaderboard';
import RewardsProfile from './components/RewardsProfile';
import LocationModal from './components/LocationModal';

const DEFAULT_CITIES = {
  'New York': { lat: 40.7128, lng: -74.0060, radiusKm: 50, region: 'East Coast' },
  'Los Angeles': { lat: 34.0522, lng: -118.2437, radiusKm: 60, region: 'West Coast' },
  'Chicago': { lat: 41.8781, lng: -87.6298, radiusKm: 45, region: 'Midwest' },
  'Mumbai': { lat: 19.0760, lng: 72.8777, radiusKm: 40, region: 'South Asia' },
  'London': { lat: 51.5074, lng: -0.1278, radiusKm: 40, region: 'Europe' }
};

export default function App() {
  const [socket, setSocket] = useState(null);
  const [currentCity, setCurrentCity] = useState('New York');
  const [activeChannel, setActiveChannel] = useState('general');
  const [activeTab, setActiveTab] = useState('chat'); // 'chat', 'leaderboard', 'profile'
  const [isVerifyOpen, setIsVerifyOpen] = useState(false);
  const [cities, setCities] = useState(DEFAULT_CITIES);

  const [user, setUser] = useState({
    id: 'usr_demo',
    username: 'ZynoPioneer',
    city: 'New York',
    points: 120,
    streakDays: 3,
    locationVerified: false,
    badges: ['Early Pioneer'],
    crownLevel: 'Bronze'
  });

  useEffect(() => {
    // Connect to WebSocket backend
    const newSocket = io(window.location.origin, {
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Auto login demo user
    fetch('/api/user/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: 'ZynoPioneer', city: currentCity })
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
        }
      })
      .catch((err) => console.error('Login error:', err));

    newSocket.on('points_updated', ({ points, earned, reason }) => {
      setUser((prev) => ({ ...prev, points }));
    });

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const handleVerifySuccess = (verificationData) => {
    setUser((prev) => ({
      ...prev,
      locationVerified: true,
      verifiedCity: verificationData.targetCity,
      points: prev.points + 50,
      badges: prev.badges.includes('Verified Local') ? prev.badges : [...prev.badges, 'Verified Local']
    }));
  };

  const handleRedeemSuccess = (redeemData) => {
    if (redeemData.newTotalPoints) {
      setUser((prev) => ({ ...prev, points: redeemData.newTotalPoints }));
    }
  };

  return (
    <div class="min-h-screen bg-zyno-dark text-slate-100 flex flex-col font-sans antialiased">
      <Header
        user={user}
        onOpenVerify={() => setIsVerifyOpen(true)}
        currentCity={currentCity}
        onSelectCity={(city) => {
          setCurrentCity(city);
          setUser((prev) => ({ ...prev, city }));
        }}
        cities={cities}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main class="flex-1 overflow-x-hidden">
        {activeTab === 'chat' && (
          <ChatRoom
            socket={socket}
            currentCity={currentCity}
            activeChannel={activeChannel}
            setActiveChannel={setActiveChannel}
            user={user}
          />
        )}

        {activeTab === 'leaderboard' && (
          <Leaderboard currentCity={currentCity} user={user} />
        )}

        {activeTab === 'profile' && (
          <RewardsProfile user={user} onRedeemSuccess={handleRedeemSuccess} />
        )}
      </main>

      <LocationModal
        isOpen={isVerifyOpen}
        onClose={() => setIsVerifyOpen(false)}
        currentCity={currentCity}
        userId={user?.id}
        onVerifySuccess={handleVerifySuccess}
      />
    </div>
  );
}
