import React, { useState, useEffect } from 'react';
import { Award, Zap, Gift, ShieldCheck, CheckCircle2, AlertCircle, Copy, ExternalLink, Sparkles, Crown } from 'lucide-react';

export default function ConquerHub({ userProfile, setUserProfile, showNotification }) {
  const [rewardsList, setRewardsList] = useState([]);
  const [selectedReward, setSelectedReward] = useState(null);
  const [upiVpa, setUpiVpa] = useState('');
  const [redeemInputCode, setRedeemInputCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [payoutResult, setPayoutResult] = useState(null);
  const [showUpiModal, setShowUpiModal] = useState(false);

  useEffect(() => {
    fetch('/api/rewards')
      .then(res => res.json())
      .then(data => setRewardsList(data.rewards || []))
      .catch(err => console.error(err));
  }, []);

  const handleClaimUpi = (e) => {
    e.preventDefault();
    if (!selectedReward || !upiVpa) return;

    setIsProcessing(true);
    setPayoutResult(null);

    fetch('/api/rewards/upi-claim', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userProfile.userId,
        upiId: upiVpa,
        rewardId: selectedReward.id,
        points: userProfile.points
      })
    })
      .then(res => res.json())
      .then(data => {
        setIsProcessing(false);
        if (data.success) {
          setPayoutResult(data);
          setUserProfile(prev => ({ ...prev, points: data.updatedPoints }));
          showNotification(`🎉 ${data.message}`);
        } else {
          setPayoutResult({ success: false, error: data.error });
        }
      })
      .catch(() => {
        setIsProcessing(false);
        setPayoutResult({ success: false, error: 'Network payout error' });
      });
  };

  const handleGenerateDailyCode = () => {
    fetch('/api/rewards/generate-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userProfile.userId })
    })
      .then(res => res.json())
      .then(data => {
        setGeneratedCode(data.code);
        showNotification('🎁 Daily reward code generated!');
      });
  };

  const handleRedeemInputCode = (e) => {
    e.preventDefault();
    if (!redeemInputCode.trim()) return;

    fetch('/api/rewards/redeem-code', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userProfile.userId,
        code: redeemInputCode,
        points: userProfile.points
      })
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUserProfile(prev => ({ ...prev, points: data.updatedPoints }));
          showNotification(`🌟 ${data.message}`);
          setRedeemInputCode('');
        } else {
          showNotification(`❌ ${data.error}`);
        }
      });
  };

  return (
    <div className="p-4 space-y-4 bg-[#071A24]">

      {/* Star Goal Header Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#072A35] via-[#0B2B38] to-[#00E5FF] p-4 border border-[#00E5FF]/40 shadow-xl">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[#FFD700] font-black text-xs uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4 fill-[#FFD700]" />
              <span>THE DESTINATION OF ACHIEVEMENT</span>
            </div>
            <h2 className="text-xl font-extrabold text-white">
              CONQUER & REWARD
            </h2>
            <p className="text-xs text-cyan-100/80 mt-1 max-w-[210px]">
              Convert engagement into tangible UPI transfers, voucher codes, and VIP crown status!
            </p>
          </div>

          <div className="flex flex-col items-center bg-[#071A24]/80 p-3 rounded-2xl border border-[#00E5FF]/40 backdrop-blur-md">
            <Crown className="w-7 h-7 text-[#FFD700] animate-pulse" />
            <span className="text-xs font-extrabold text-white mt-1">{userProfile.points}</span>
            <span className="text-[9px] text-[#00E5FF] uppercase tracking-wider font-bold">Zyno Points</span>
          </div>
        </div>

        {/* Star highlight decorative element */}
        <div className="absolute top-2 right-12 w-20 h-20 bg-[#FFD700]/15 rounded-full blur-xl pointer-events-none"></div>
      </div>

      {/* Profile Achievement Status & Crowns */}
      <div className="bg-[#0F384A] border border-[#00E5FF]/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-bold text-xs text-white flex items-center gap-1.5">
            <Award className="w-4 h-4 text-[#00E5FF]" />
            <span>Unlocked Badges & Crowns</span>
          </span>
          <span className="text-[10px] text-[#00C9A7] font-semibold">{userProfile.crown}</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {userProfile.badges.map((b, i) => (
            <span
              key={i}
              className="bg-[#071A24] border border-[#00E5FF]/30 text-cyan-200 font-semibold text-xs px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1"
            >
              <span>{b}</span>
            </span>
          ))}
        </div>
      </div>

      {/* Rewards Catalog (UPI & Codes) */}
      <div className="bg-[#0F384A] border border-[#00E5FF]/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-bold text-xs text-white flex items-center gap-1.5">
            <Gift className="w-4 h-4 text-[#FFD700]" />
            <span>Redeemable Rewards</span>
          </span>
          <span className="text-[10px] text-gray-300">Instant UPI & In-App Perks</span>
        </div>

        <div className="grid grid-cols-1 gap-2.5">
          {rewardsList.map((reward) => {
            const canAfford = userProfile.points >= reward.pointsCost;
            return (
              <div
                key={reward.id}
                className="flex items-center justify-between p-3 bg-[#071A24] rounded-xl border border-white/5 hover:border-[#00E5FF]/40 transition-all"
              >
                <div>
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <span>{reward.title}</span>
                    <span className="text-[9px] bg-white/10 text-gray-300 px-1.5 py-0.5 rounded font-normal uppercase">
                      {reward.type}
                    </span>
                  </div>
                  <div className="text-[10px] text-gray-400 mt-0.5">
                    Cost: <strong className="text-[#FFD700]">{reward.pointsCost} Points</strong>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedReward(reward);
                    setShowUpiModal(true);
                  }}
                  disabled={!canAfford}
                  className={`text-xs px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1 ${
                    canAfford
                      ? 'bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] shadow hover:scale-105 active:scale-95'
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed border border-white/5'
                  }`}
                >
                  <span>Redeem</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Daily Redeem Code Section */}
      <div className="bg-[#0F384A] border border-[#00E5FF]/30 rounded-2xl p-4 shadow-lg space-y-3">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="font-bold text-xs text-white flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-[#00E5FF]" />
            <span>Daily Redeem Codes & Bonuses</span>
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between bg-[#071A24] p-3 rounded-xl border border-white/5">
            <div>
              <div className="text-xs font-bold text-white">Daily Streak Voucher Code</div>
              <div className="text-[10px] text-gray-400">Generate daily active login coupon</div>
            </div>
            <button
              onClick={handleGenerateDailyCode}
              className="bg-[#004D61] hover:bg-[#00E5FF] hover:text-[#071A24] text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-[#00E5FF]/30 transition-all"
            >
              Generate
            </button>
          </div>

          {generatedCode && (
            <div className="bg-[#00C9A7]/10 border border-[#00C9A7]/40 p-2.5 rounded-xl flex items-center justify-between text-xs text-[#00C9A7] font-bold">
              <span>Code: {generatedCode}</span>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  showNotification('Copied code to clipboard!');
                }}
                className="p-1 hover:bg-white/10 rounded"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <form onSubmit={handleRedeemInputCode} className="flex gap-2">
            <input
              type="text"
              value={redeemInputCode}
              onChange={(e) => setRedeemInputCode(e.target.value)}
              placeholder="Enter voucher code (e.g. ZYNO-ABC123)..."
              className="flex-1 bg-[#071A24] border border-[#00E5FF]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] text-xs font-bold px-4 py-2 rounded-xl shadow hover:scale-105 active:scale-95 transition-all"
            >
              Claim Code
            </button>
          </form>
        </div>
      </div>

      {/* Modal for UPI Transfer Claim */}
      {showUpiModal && selectedReward && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B2B38] border border-[#00E5FF]/40 rounded-2xl p-5 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-2">
              <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#00C9A7]" />
                <span>Instant UPI Transfer Verification</span>
              </h3>
              <button
                onClick={() => setShowUpiModal(false)}
                className="text-gray-400 hover:text-white text-xs font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="bg-[#071A24] p-3 rounded-xl border border-white/5 space-y-1">
              <div className="text-xs font-bold text-[#00E5FF]">{selectedReward.title}</div>
              <div className="text-[11px] text-gray-300">Cost: {selectedReward.pointsCost} Zyno Points</div>
              <div className="text-[10px] text-gray-400">Direct transfer to your verified UPI VPA ID.</div>
            </div>

            <form onSubmit={handleClaimUpi} className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-gray-300 mb-1">
                  Enter UPI VPA ID (Virtual Payment Address)
                </label>
                <input
                  type="text"
                  required
                  value={upiVpa}
                  onChange={(e) => setUpiVpa(e.target.value)}
                  placeholder="username@upi or mobile@okaxis"
                  className="w-full bg-[#071A24] border border-[#00E5FF]/30 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
                />
              </div>

              {payoutResult && (
                <div className={`p-2.5 rounded-xl text-xs ${
                  payoutResult.success
                    ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200'
                    : 'bg-red-950/60 border border-red-500/40 text-red-200'
                }`}>
                  {payoutResult.success ? (
                    <div className="space-y-1">
                      <div className="font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Payout Sent Successfully!</span>
                      </div>
                      <div className="text-[10px] text-emerald-300/80">Ref: {payoutResult.transaction.payoutRef}</div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-400" />
                      <span>{payoutResult.error}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowUpiModal(false)}
                  className="bg-[#0F384A] text-gray-300 text-xs px-3 py-2 rounded-xl border border-white/10"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] font-bold text-xs px-4 py-2 rounded-xl shadow hover:scale-105 active:scale-95 transition-all"
                >
                  {isProcessing ? 'Processing UPI Transfer...' : 'Confirm UPI Transfer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
