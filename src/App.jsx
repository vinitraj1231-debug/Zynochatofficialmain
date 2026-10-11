import React, { useState, useEffect } from 'react';
import ConnectHub from './components/ConnectHub';
import CompeteHub from './components/CompeteHub';
import ConquerHub from './components/ConquerHub';
import { MessageSquare, Trophy, Award, MapPin, Zap, Flame, Crown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('connect');
  const [userId] = useState(() => 'user_' + Math.random().toString(36).substring(2, 7));
  const [userProfile, setUserProfile] = useState({
    userId,
    name: 'Speedster_Z',
    city: 'Mumbai',
    points: 320,
    streakDays: 4,
    crown: 'City Challenger 👑',
    badges: ['Local Pioneer 🌟', 'Chat Starter 💬'],
    isVerified: true
  });

  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Fetch initial profile
    fetch(`/api/profile/${userId}?name=${userProfile.name}&city=${userProfile.city}`)
      .then(res => res.json())
      .then(data => {
        if (data) setUserProfile(data);
      })
      .catch(err => console.error('Failed to load profile:', err));
  }, [userId]);

  const showNotification = (text) => {
    setNotification(text);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleCityChange = (newCity) => {
    setUserProfile(prev => ({ ...prev, city: newCity }));
    showNotification(`📍 Welcome to ${newCity} Hyper-Local Hub!`);
  };

  const handlePointsEarned = (points, reason) => {
    setUserProfile(prev => ({ ...prev, points: prev.points + points }));
    showNotification(`⚡ +${points} Zyno Points! (${reason})`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#071A24] text-white max-w-md mx-auto shadow-2xl relative border-x border-[#0B2B38]">

      {/* Top Brand Header */}
      <header className="bg-gradient-to-r from-[#072A35] via-[#0B2B38] to-[#004D61] p-3 border-b border-[#00E5FF]/20 flex items-center justify-between sticky top-0 z-50 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="relative">
            <img
              src="/assets/logo.jpg"
              alt="Zynochat Logo"
              className="h-10 w-auto rounded-lg object-contain shadow-md border border-[#00E5FF]/30"
            />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00E5FF] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#00C9A7]"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h1 className="font-extrabold text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00E5FF] to-[#00C9A7]">
                ZYNOCHAT
              </h1>
            </div>
            <p className="text-[9px] font-semibold tracking-widest text-gray-300 -mt-1">
              CONNECT • COMPETE • CONQUER
            </p>
          </div>
        </div>

        {/* User Stats Snapshot */}
        <div className="flex items-center gap-2 bg-[#0F384A]/80 px-2.5 py-1 rounded-full border border-[#00E5FF]/30">
          <div className="flex items-center gap-1 text-[#FFD700] text-xs font-bold">
            <Zap className="w-3.5 h-3.5 fill-[#FFD700]" />
            <span>{userProfile.points}</span>
          </div>
          <span className="text-[#00E5FF]/40 text-xs">|</span>
          <div className="flex items-center gap-1 text-[#FF5722] text-xs font-bold">
            <Flame className="w-3.5 h-3.5 fill-[#FF5722]" />
            <span>{userProfile.streakDays}d</span>
          </div>
        </div>
      </header>

      {/* Floating Notification */}
      {notification && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] font-bold text-xs px-4 py-2 rounded-full shadow-lg border border-white/40 animate-bounce flex items-center gap-1.5">
          <span>{notification}</span>
        </div>
      )}

      {/* Main Screen Content */}
      <main className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'connect' && (
          <ConnectHub
            userProfile={userProfile}
            onCityChange={handleCityChange}
            onPointsEarned={handlePointsEarned}
          />
        )}
        {activeTab === 'compete' && (
          <CompeteHub
            userProfile={userProfile}
            onPointsEarned={handlePointsEarned}
          />
        )}
        {activeTab === 'conquer' && (
          <ConquerHub
            userProfile={userProfile}
            setUserProfile={setUserProfile}
            showNotification={showNotification}
          />
        )}
      </main>

      {/* Bottom Mobile Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#072A35]/95 backdrop-blur-md border-t border-[#00E5FF]/30 z-50 grid grid-cols-3 p-1">
        <button
          onClick={() => setActiveTab('connect')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all ${
            activeTab === 'connect'
              ? 'text-[#00E5FF] bg-[#0F384A] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wider">CONNECT</span>
        </button>

        <button
          onClick={() => setActiveTab('compete')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all ${
            activeTab === 'compete'
              ? 'text-[#00E5FF] bg-[#0F384A] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wider">COMPETE</span>
        </button>

        <button
          onClick={() => setActiveTab('conquer')}
          className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-lg transition-all ${
            activeTab === 'conquer'
              ? 'text-[#00E5FF] bg-[#0F384A] border border-[#00E5FF]/40 shadow-[0_0_10px_rgba(0,229,255,0.2)]'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Award className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-bold tracking-wider">CONQUER</span>
        </button>
      </nav>
    </div>
  );
}
