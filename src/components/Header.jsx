import React, { useState } from 'react';
import { Flame, Star, ShieldCheck, MapPin, Award, User, RefreshCw } from 'lucide-react';

export default function Header({ user, onOpenVerify, currentCity, onSelectCity, cities, activeTab, setActiveTab }) {
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  return (
    <header class="bg-zyno-gradient text-white shadow-xl sticky top-0 z-50 border-b border-cyan-500/20">
      <div class="max-w-7xl mx-auto px-3 py-2.5 flex items-center justify-between">

        {/* Brand Logo & Slogan */}
        <div class="flex items-center gap-3">
          <div class="relative group cursor-pointer" onClick={() => setActiveTab('chat')}>
            <div class="w-10 h-10 rounded-xl overflow-hidden border-2 border-cyan-300 shadow-md flex items-center justify-between bg-black/40">
              <img src="/logo.jpg" alt="Zynochat Logo" class="w-full h-full object-cover" />
            </div>
            <span class="absolute -bottom-1 -right-1 bg-amber-400 text-zinc-950 font-extrabold text-[9px] px-1 rounded-full border border-black flex items-center gap-0.5">
              <Star class="w-2.5 h-2.5 fill-black" />
              ECO
            </span>
          </div>

          <div>
            <div class="flex items-center gap-1.5">
              <h1 class="font-black text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
                ZYNOCHAT
              </h1>
              <span class="text-[10px] font-semibold bg-cyan-950/80 text-cyan-300 px-1.5 py-0.5 rounded border border-cyan-500/30">
                v1.0 MVP
              </span>
            </div>
            <p class="text-[10px] font-medium tracking-widest text-cyan-100 uppercase opacity-90 hidden sm:block">
              CONNECT • COMPETE • CONQUER
            </p>
          </div>
        </div>

        {/* City Selector & Location Verification Status */}
        <div class="relative flex items-center gap-2">
          <div class="relative">
            <button
              onClick={() => setShowCityDropdown(!showCityDropdown)}
              class="flex items-center gap-1.5 bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-100 px-2.5 py-1.5 rounded-lg border border-cyan-400/30 transition text-xs font-semibold"
            >
              <MapPin class="w-3.5 h-3.5 text-cyan-400" />
              <span>{currentCity}</span>
            </button>

            {showCityDropdown && (
              <div class="absolute right-0 mt-2 w-48 bg-zyno-dark border border-cyan-500/30 rounded-xl shadow-2xl py-1 z-50">
                <div class="px-3 py-1.5 text-[10px] uppercase font-bold text-cyan-400 border-b border-cyan-900/50">
                  Select Local Hub
                </div>
                {Object.keys(cities).map((cityName) => (
                  <button
                    key={cityName}
                    onClick={() => {
                      onSelectCity(cityName);
                      setShowCityDropdown(false);
                    }}
                    class={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-cyan-900/40 ${
                      currentCity === cityName ? 'text-cyan-300 font-bold bg-cyan-950/60' : 'text-slate-200'
                    }`}
                  >
                    <span>{cityName}</span>
                    <span class="text-[10px] text-cyan-400/70">{cities[cityName].region}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={onOpenVerify}
            class={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-bold transition shadow-sm ${
              user?.locationVerified
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
            }`}
          >
            <ShieldCheck class="w-3.5 h-3.5" />
            <span class="hidden md:inline">
              {user?.locationVerified ? 'Verified Local' : 'Verify Location'}
            </span>
          </button>
        </div>

        {/* User Stats Summary */}
        <div class="flex items-center gap-2">
          {/* Streak Counter */}
          <div class="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 px-2 py-1 rounded-lg text-xs font-bold" title="Daily Activity Streak">
            <Flame class="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
            <span>{user?.streakDays || 1}d</span>
          </div>

          {/* Points Counter */}
          <div class="flex items-center gap-1 bg-cyan-500/10 border border-cyan-400/30 text-cyan-200 px-2.5 py-1 rounded-lg text-xs font-bold" title="Total Engagement Points">
            <Star class="w-3.5 h-3.5 text-cyan-300 fill-cyan-300" />
            <span>{user?.points || 0} pts</span>
          </div>
        </div>

      </div>

      {/* Tab Navigation Menu */}
      <nav class="flex justify-around bg-zyno-dark/95 border-t border-cyan-500/20 text-xs">
        <button
          onClick={() => setActiveTab('chat')}
          class={`flex-1 py-2 text-center font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'chat'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <MapPin class="w-3.5 h-3.5" />
          <span>Local Channels</span>
        </button>

        <button
          onClick={() => setActiveTab('leaderboard')}
          class={`flex-1 py-2 text-center font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'leaderboard'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Award class="w-3.5 h-3.5" />
          <span>Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          class={`flex-1 py-2 text-center font-bold border-b-2 transition flex items-center justify-center gap-1.5 ${
            activeTab === 'profile'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <User class="w-3.5 h-3.5" />
          <span>Rewards & Badges</span>
        </button>
      </nav>
    </header>
  );
}
