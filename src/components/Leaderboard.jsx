import React, { useState, useEffect } from 'react';
import { Award, Trophy, Crown, Flame, ShieldCheck, RefreshCw, Star, MapPin, Globe } from 'lucide-react';

export default function Leaderboard({ currentCity, user }) {
  const [scope, setScope] = useState('city'); // 'city' or 'national'
  const [leaderboards, setLeaderboards] = useState({ cityLeaderboard: [], nationalLeaderboard: [] });
  const [loading, setLoading] = useState(true);

  const fetchLeaderboards = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/leaderboard?city=${encodeURIComponent(currentCity)}`);
      const data = await res.json();
      setLeaderboards(data);
    } catch (err) {
      console.error('Failed to fetch leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboards();
  }, [currentCity, user]);

  const activeList = scope === 'city' ? leaderboards.cityLeaderboard : leaderboards.nationalLeaderboard;

  const getRankBadge = (rank) => {
    if (rank === 1) return <Crown class="w-5 h-5 text-amber-400 fill-amber-400 animate-bounce" />;
    if (rank === 2) return <Crown class="w-5 h-5 text-slate-300 fill-slate-300" />;
    if (rank === 3) return <Crown class="w-5 h-5 text-amber-600 fill-amber-600" />;
    return <span class="font-bold text-slate-400 text-xs font-mono">#{rank}</span>;
  };

  return (
    <div class="max-w-4xl mx-auto p-4 space-y-6">

      {/* Pillar Header Banner */}
      <div class="bg-zyno-gradient rounded-2xl p-6 text-white border border-cyan-400/30 shadow-2xl relative overflow-hidden">
        <div class="absolute -right-6 -bottom-6 opacity-10 pointer-events-none">
          <Trophy class="w-48 h-48 text-cyan-200" />
        </div>
        <div class="relative z-10">
          <div class="flex items-center gap-2 mb-1">
            <span class="bg-cyan-950/80 text-cyan-300 text-[10px] font-extrabold px-2 py-0.5 rounded border border-cyan-500/30">
              PILLAR 2 & 3: COMPETE & CONQUER
            </span>
          </div>
          <h2 class="text-2xl font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-100 to-cyan-300">
            Local & Regional Standings
          </h2>
          <p class="text-xs text-cyan-100 max-w-lg mt-1 leading-relaxed">
            Engage in local channels, win trivia, maintain activity streaks, and climb the ranks to earn exclusive rewards, crown titles, and redeem vouchers!
          </p>
        </div>
      </div>

      {/* Scope Filter Switcher */}
      <div class="flex items-center justify-between bg-zyno-card p-1.5 rounded-xl border border-cyan-500/20">
        <div class="flex gap-1">
          <button
            onClick={() => setScope('city')}
            class={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
              scope === 'city'
                ? 'bg-zyno-gradient text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MapPin class="w-3.5 h-3.5" />
            <span>{currentCity} Rankings</span>
          </button>
          <button
            onClick={() => setScope('national')}
            class={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition ${
              scope === 'national'
                ? 'bg-zyno-gradient text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Globe class="w-3.5 h-3.5" />
            <span>National Leaderboard</span>
          </button>
        </div>

        <button
          onClick={fetchLeaderboards}
          class="p-2 text-cyan-400 hover:text-cyan-200 transition"
          title="Refresh standings"
        >
          <RefreshCw class={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Leaderboard Table List */}
      <div class="bg-zyno-card rounded-2xl border border-cyan-500/20 overflow-hidden shadow-xl">
        <div class="grid grid-cols-12 px-4 py-3 bg-zyno-deep/80 text-[10px] font-extrabold uppercase tracking-wider text-cyan-400 border-b border-cyan-500/20">
          <div class="col-span-2 text-center">Rank</div>
          <div class="col-span-5">Community Member</div>
          <div class="col-span-2 text-center">Streak</div>
          <div class="col-span-3 text-right">Engagement Points</div>
        </div>

        <div class="divide-y divide-cyan-900/40">
          {activeList.map((usr, index) => {
            const rank = index + 1;
            const isCurrentUser = usr.id === user?.id;

            return (
              <div
                key={usr.id}
                class={`grid grid-cols-12 px-4 py-3.5 items-center text-xs transition ${
                  isCurrentUser
                    ? 'bg-cyan-950/60 border-l-4 border-l-cyan-400 font-bold'
                    : 'hover:bg-cyan-900/20'
                }`}
              >
                {/* Rank Badge */}
                <div class="col-span-2 flex items-center justify-center">
                  {getRankBadge(rank)}
                </div>

                {/* User Info */}
                <div class="col-span-5 flex items-center gap-2.5">
                  <div class="w-8 h-8 rounded-full bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-300 font-bold text-xs">
                    {usr.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div class="flex items-center gap-1.5 font-bold text-white">
                      <span>{usr.username}</span>
                      {usr.locationVerified && (
                        <ShieldCheck class="w-3.5 h-3.5 text-emerald-400" title="Verified Local Resident" />
                      )}
                    </div>
                    <div class="flex items-center gap-1 text-[10px] text-cyan-400/80">
                      <span>{usr.crownLevel || 'Bronze'} Crown</span>
                      <span>•</span>
                      <span>{usr.city}</span>
                    </div>
                  </div>
                </div>

                {/* Streak */}
                <div class="col-span-2 flex items-center justify-center gap-1 text-amber-300 font-bold">
                  <Flame class="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{usr.streakDays || 1}d</span>
                </div>

                {/* Points */}
                <div class="col-span-3 text-right font-mono font-extrabold text-cyan-300 flex items-center justify-end gap-1">
                  <Star class="w-3.5 h-3.5 text-cyan-400 fill-cyan-400" />
                  <span>{usr.points}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
