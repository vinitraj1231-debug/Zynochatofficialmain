import React, { useState } from 'react';
import { Star, ShieldCheck, Flame, Gift, Check, Trophy, Ticket, AlertCircle, Sparkles } from 'lucide-react';

export default function RewardsProfile({ user, onRedeemSuccess }) {
  const [promoCode, setPromoCode] = useState('');
  const [redeemStatus, setRedeemStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleRedeem = async (e) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setLoading(true);
    setRedeemStatus(null);

    try {
      const res = await fetch('/api/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          code: promoCode.trim()
        })
      });

      const data = await res.json();
      setRedeemStatus(data);
      if (data.success) {
        setPromoCode('');
        if (onRedeemSuccess) onRedeemSuccess(data);
      }
    } catch (err) {
      setRedeemStatus({ success: false, message: 'Redemption request failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="max-w-4xl mx-auto p-4 space-y-6">

      {/* Profile Overview Card */}
      <div class="bg-zyno-card rounded-2xl border border-cyan-500/30 p-6 shadow-2xl relative overflow-hidden">
        <div class="flex flex-col md:flex-row items-center gap-6">
          <div class="relative">
            <div class="w-20 h-20 rounded-2xl bg-zyno-gradient border-2 border-cyan-300 p-1 flex items-center justify-center shadow-lg">
              <span class="text-3xl font-black text-white">
                {user?.username?.charAt(0).toUpperCase() || 'Z'}
              </span>
            </div>
            <span class="absolute -bottom-2 -right-2 bg-amber-400 text-zinc-950 font-black text-[10px] px-2 py-0.5 rounded-full border border-black shadow">
              {user?.crownLevel || 'Bronze'}
            </span>
          </div>

          <div class="flex-1 text-center md:text-left space-y-1">
            <div class="flex items-center justify-center md:justify-start gap-2">
              <h2 class="text-xl font-black text-white">{user?.username}</h2>
              {user?.locationVerified && (
                <span class="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <ShieldCheck class="w-3.5 h-3.5" />
                  Verified Local ({user?.verifiedCity || user?.city})
                </span>
              )}
            </div>
            <p class="text-xs text-slate-400">
              Community Member in <strong class="text-cyan-300">{user?.city || 'New York'}</strong>
            </p>

            <div class="flex flex-wrap items-center justify-center md:justify-start gap-2 pt-2">
              {user?.badges?.map((badge, idx) => (
                <span key={idx} class="text-[10px] font-bold bg-cyan-950/80 text-cyan-300 px-2.5 py-1 rounded-lg border border-cyan-500/30">
                  🏆 {badge}
                </span>
              ))}
            </div>
          </div>

          <div class="flex items-center gap-4 bg-cyan-950/50 p-4 rounded-xl border border-cyan-500/20 text-center">
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Activity Streak</div>
              <div class="text-lg font-extrabold text-amber-300 flex items-center justify-center gap-1">
                <Flame class="w-4 h-4 fill-amber-400 text-amber-400" />
                {user?.streakDays || 1} Days
              </div>
            </div>
            <div class="h-8 border-r border-cyan-500/20"></div>
            <div>
              <div class="text-[10px] uppercase font-bold text-slate-400">Points</div>
              <div class="text-lg font-extrabold text-cyan-300 flex items-center justify-center gap-1">
                <Star class="w-4 h-4 fill-cyan-300 text-cyan-300" />
                {user?.points || 0}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pillar 3 CONQUER Code Redemption Section */}
      <div class="bg-gradient-to-br from-cyan-950/90 to-zyno-card p-6 rounded-2xl border border-cyan-500/30 shadow-xl space-y-4">
        <div class="flex items-center gap-3">
          <div class="p-3 bg-cyan-500/10 rounded-xl border border-cyan-400/30 text-cyan-300">
            <Gift class="w-6 h-6" />
          </div>
          <div>
            <h3 class="font-black text-lg text-white">Redeem Daily Codes & Rewards</h3>
            <p class="text-xs text-slate-300">
              Convert community engagement into tangible vouchers, instant UPI cash rewards, and exclusive badge effects!
            </p>
          </div>
        </div>

        <form onSubmit={handleRedeem} class="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Enter code (e.g. ZYNOFREE50, CONQUER2025)"
            class="flex-1 bg-zyno-dark/90 border border-cyan-500/40 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 font-mono tracking-wider focus:outline-none focus:border-cyan-300"
          />
          <button
            type="submit"
            disabled={loading || !promoCode.trim()}
            class="py-2.5 px-6 bg-zyno-cyan-glow text-zinc-950 font-black rounded-xl hover:brightness-110 transition disabled:opacity-40 text-xs shadow-md shadow-cyan-500/20"
          >
            {loading ? 'Redeeming...' : 'Claim Reward'}
          </button>
        </form>

        {redeemStatus && (
          <div class={`p-3 rounded-xl border text-xs ${
            redeemStatus.success
              ? 'bg-emerald-950/70 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/70 border-rose-500/40 text-rose-200'
          }`}>
            {redeemStatus.message}
          </div>
        )}

        {/* Demo Active Promo Codes Reference */}
        <div class="pt-2">
          <div class="text-[10px] uppercase font-extrabold text-cyan-400 mb-2">
            Available Community Codes for Testing
          </div>
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div onClick={() => setPromoCode('ZYNOFREE50')} class="cursor-pointer bg-zyno-dark/80 p-2.5 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition text-xs">
              <div class="font-mono font-bold text-cyan-300">ZYNOFREE50</div>
              <div class="text-[10px] text-slate-400">$5 Local Cafe Voucher (+50 pts)</div>
            </div>
            <div onClick={() => setPromoCode('CONQUER2025')} class="cursor-pointer bg-zyno-dark/80 p-2.5 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition text-xs">
              <div class="font-mono font-bold text-cyan-300">CONQUER2025</div>
              <div class="text-[10px] text-slate-400">Exclusive Gold Crown (+100 pts)</div>
            </div>
            <div onClick={() => setPromoCode('LOCALCHAMP')} class="cursor-pointer bg-zyno-dark/80 p-2.5 rounded-xl border border-cyan-500/20 hover:border-cyan-400 transition text-xs">
              <div class="font-mono font-bold text-cyan-300">LOCALCHAMP</div>
              <div class="text-[10px] text-slate-400">Local Event Priority Pass (+75 pts)</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
