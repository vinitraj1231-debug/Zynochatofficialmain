import React, { useState, useEffect } from 'react';
import { Trophy, Flame, HelpCircle, Gamepad2, Award, Zap, ChevronRight, CheckCircle2, RefreshCw } from 'lucide-react';

export default function CompeteHub({ userProfile, onPointsEarned }) {
  const [activeSubTab, setActiveSubTab] = useState('trivia'); // 'trivia', 'minigame', 'leaderboard'
  const [triviaQuestion, setTriviaQuestion] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [triviaResult, setTriviaResult] = useState(null);
  const [leaderboardData, setLeaderboardData] = useState({ cities: [], nationalUsers: [] });
  const [leaderboardType, setLeaderboardType] = useState('cities'); // 'cities' or 'national'

  // Mini-Game State (Speed Tap Master)
  const [gameState, setGameState] = useState('IDLE'); // 'IDLE', 'PLAYING', 'FINISHED'
  const [tapScore, setTapScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(10);

  useEffect(() => {
    fetchTrivia();
    fetchLeaderboards();
  }, []);

  const fetchTrivia = () => {
    setTriviaQuestion(null);
    setSelectedOption(null);
    setTriviaResult(null);

    fetch('/api/trivia/question')
      .then(res => res.json())
      .then(data => setTriviaQuestion(data))
      .catch(err => console.error(err));
  };

  const fetchLeaderboards = () => {
    fetch('/api/leaderboards')
      .then(res => res.json())
      .then(data => setLeaderboardData(data))
      .catch(err => console.error(err));
  };

  const handleAnswerSubmit = (idx) => {
    if (selectedOption !== null || !triviaQuestion) return;
    setSelectedOption(idx);

    fetch('/api/trivia/answer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: userProfile.userId,
        questionId: triviaQuestion.id,
        selectedIndex: idx
      })
    })
      .then(res => res.json())
      .then(data => {
        setTriviaResult(data);
        if (data.correct) {
          onPointsEarned(data.pointsAwarded, 'Trivia Victory 🧠');
          fetchLeaderboards();
        }
      })
      .catch(err => console.error(err));
  };

  // Mini-Game Logic
  useEffect(() => {
    let timer;
    if (gameState === 'PLAYING' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (gameState === 'PLAYING' && timeLeft === 0) {
      setGameState('FINISHED');
      const pts = Math.min(tapScore * 5, 200);
      if (pts > 0) {
        onPointsEarned(pts, 'Tap Master Challenge 🎮');
      }
    }
    return () => clearInterval(timer);
  }, [gameState, timeLeft, tapScore]);

  const startMiniGame = () => {
    setTapScore(0);
    setTimeLeft(10);
    setGameState('PLAYING');
  };

  const handleTap = () => {
    if (gameState === 'PLAYING') {
      setTapScore(prev => prev + 1);
    }
  };

  return (
    <div className="p-4 space-y-4 bg-[#071A24]">

      {/* Upward Swoosh Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B2B38] via-[#004D61] to-[#00E5FF] p-4 border border-[#00E5FF]/40 shadow-xl">
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-[#00E5FF] font-black text-xs uppercase tracking-widest mb-1">
              <Trophy className="w-4 h-4 text-[#FFD700]" />
              <span>COMPETE & ASCEND</span>
            </div>
            <h2 className="text-xl font-extrabold text-white leading-tight">
              City-vs-City Arena
            </h2>
            <p className="text-xs text-cyan-100/80 mt-1 max-w-[210px]">
              Engage in daily trivia and skill games to climb national leaderboards for your city!
            </p>
          </div>

          <div className="flex flex-col items-center bg-[#071A24]/70 p-2.5 rounded-xl border border-[#00E5FF]/30 backdrop-blur-md">
            <Flame className="w-6 h-6 text-[#FF5722] animate-bounce" />
            <span className="text-xs font-bold text-white mt-1">{userProfile.streakDays} Days</span>
            <span className="text-[9px] text-gray-300">Active Streak</span>
          </div>
        </div>

        {/* Swoosh decorative backdrop */}
        <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#00E5FF]/20 rounded-full blur-2xl pointer-events-none"></div>
      </div>

      {/* Sub-Navigation Switcher */}
      <div className="flex items-center bg-[#0B2B38] p-1 rounded-xl border border-[#00E5FF]/20 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('trivia')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'trivia'
              ? 'bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] font-bold shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Trivia</span>
        </button>

        <button
          onClick={() => setActiveSubTab('minigame')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'minigame'
              ? 'bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] font-bold shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Gamepad2 className="w-3.5 h-3.5" />
          <span>Mini-Game</span>
        </button>

        <button
          onClick={() => setActiveSubTab('leaderboard')}
          className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1 ${
            activeSubTab === 'leaderboard'
              ? 'bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] font-bold shadow'
              : 'text-gray-300 hover:text-white'
          }`}
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>Ranks</span>
        </button>
      </div>

      {/* 1. City-vs-City Trivia Challenge */}
      {activeSubTab === 'trivia' && (
        <div className="bg-[#0F384A] border border-[#00E5FF]/30 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <div className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-[#00E5FF]" />
              <span className="font-bold text-xs text-white">Daily City Trivia Challenge</span>
            </div>
            {triviaQuestion && (
              <span className="text-[10px] bg-[#00E5FF]/20 text-[#00E5FF] font-bold px-2 py-0.5 rounded-full border border-[#00E5FF]/30">
                +{triviaQuestion.points} Points
              </span>
            )}
          </div>

          {triviaQuestion ? (
            <div className="space-y-3">
              <div className="text-xs font-semibold text-cyan-100 bg-[#072A35] p-3 rounded-xl border border-white/5">
                {triviaQuestion.question}
              </div>

              <div className="grid grid-cols-1 gap-2">
                {triviaQuestion.options.map((opt, idx) => {
                  let btnStyle = 'bg-[#071A24] border-white/10 text-gray-200 hover:border-[#00C9A7]';
                  if (selectedOption !== null) {
                    if (idx === triviaQuestion.correctIndex) {
                      btnStyle = 'bg-emerald-600/30 border-emerald-400 text-emerald-200 font-bold';
                    } else if (selectedOption === idx) {
                      btnStyle = 'bg-red-600/30 border-red-400 text-red-200';
                    }
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswerSubmit(idx)}
                      disabled={selectedOption !== null}
                      className={`text-xs p-3 rounded-xl border text-left flex items-center justify-between transition-all ${btnStyle}`}
                    >
                      <span>{opt}</span>
                      {selectedOption !== null && idx === triviaQuestion.correctIndex && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>

              {triviaResult && (
                <div className={`p-3 rounded-xl text-xs font-semibold flex items-center justify-between ${
                  triviaResult.correct ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-200' : 'bg-red-950/60 border border-red-500/40 text-red-200'
                }`}>
                  <span>
                    {triviaResult.correct ? `🎉 Correct! +${triviaResult.pointsAwarded} Zyno Points for ${userProfile.city}!` : '❌ Incorrect answer. Try the next question!'}
                  </span>
                  <button
                    onClick={fetchTrivia}
                    className="bg-white/10 hover:bg-white/20 p-1.5 rounded-lg text-white transition-all ml-2"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-gray-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#00E5FF]" />
              <span>Loading daily question...</span>
            </div>
          )}
        </div>
      )}

      {/* 2. Interactive Skill Mini-Game (Tap Master) */}
      {activeSubTab === 'minigame' && (
        <div className="bg-[#0F384A] border border-[#00E5FF]/30 rounded-2xl p-4 shadow-lg text-center space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Gamepad2 className="w-4 h-4 text-[#FFD700]" />
              <span>Zyno Tap Speed Challenge</span>
            </span>
            <span className="text-[10px] text-gray-300">10s Blitz</span>
          </div>

          {gameState === 'IDLE' && (
            <div className="py-6 space-y-3">
              <p className="text-xs text-gray-300 max-w-xs mx-auto">
                Tap the glowing Zyno Star as fast as you can in 10 seconds to score bonus engagement points for your profile!
              </p>
              <button
                onClick={startMiniGame}
                className="bg-gradient-to-r from-[#00C9A7] to-[#00E5FF] text-[#071A24] font-black text-sm px-6 py-2.5 rounded-xl shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                START CHALLENGE 🚀
              </button>
            </div>
          )}

          {gameState === 'PLAYING' && (
            <div className="py-2 space-y-4">
              <div className="flex items-center justify-around text-xs font-bold bg-[#071A24] p-2 rounded-xl border border-white/10">
                <span className="text-gray-300">Time Left: <strong className="text-[#FF5722] text-sm">{timeLeft}s</strong></span>
                <span className="text-gray-300">Taps: <strong className="text-[#00E5FF] text-sm">{tapScore}</strong></span>
              </div>

              <button
                onClick={handleTap}
                className="w-32 h-32 mx-auto rounded-full bg-gradient-to-tr from-[#004D61] via-[#00C9A7] to-[#00E5FF] text-white flex items-center justify-center font-black text-2xl shadow-[0_0_25px_rgba(0,229,255,0.6)] active:scale-90 transition-transform cursor-pointer border-2 border-white"
              >
                TAP!
              </button>
            </div>
          )}

          {gameState === 'FINISHED' && (
            <div className="py-4 space-y-3 bg-[#071A24] p-4 rounded-xl border border-[#00E5FF]/30">
              <h3 className="text-base font-extrabold text-[#00E5FF]">Challenge Complete!</h3>
              <p className="text-xs text-gray-300">
                You hit <strong className="text-white text-sm">{tapScore} taps</strong> in 10 seconds!
              </p>
              <p className="text-xs font-bold text-[#FFD700]">
                + {Math.min(tapScore * 5, 200)} Zyno Points Awarded!
              </p>
              <button
                onClick={startMiniGame}
                className="bg-[#004D61] hover:bg-[#00E5FF] hover:text-[#071A24] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all border border-[#00E5FF]/40"
              >
                Play Again 🔄
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. Regional & National Leaderboards */}
      {activeSubTab === 'leaderboard' && (
        <div className="bg-[#0F384A] border border-[#00E5FF]/30 rounded-2xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2">
            <span className="font-bold text-xs text-white flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-[#FFD700]" />
              <span>Leaderboards</span>
            </span>

            <div className="flex bg-[#071A24] rounded-lg p-0.5 text-[10px] border border-white/10">
              <button
                onClick={() => setLeaderboardType('cities')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  leaderboardType === 'cities' ? 'bg-[#00E5FF] text-[#071A24]' : 'text-gray-400'
                }`}
              >
                City vs City
              </button>
              <button
                onClick={() => setLeaderboardType('national')}
                className={`px-2.5 py-1 rounded-md font-bold transition-all ${
                  leaderboardType === 'national' ? 'bg-[#00E5FF] text-[#071A24]' : 'text-gray-400'
                }`}
              >
                Top Conquerors
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {leaderboardType === 'cities' ? (
              leaderboardData.cities.map((city) => (
                <div
                  key={city.city}
                  className={`flex items-center justify-between p-2.5 rounded-xl border text-xs transition-all ${
                    city.city === userProfile.city
                      ? 'bg-[#00E5FF]/15 border-[#00E5FF] text-white font-bold'
                      : 'bg-[#071A24] border-white/5 text-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-black ${
                      city.rank === 1 ? 'bg-[#FFD700] text-black' :
                      city.rank === 2 ? 'bg-[#C0C0C0] text-black' :
                      city.rank === 3 ? 'bg-[#CD7F32] text-white' : 'bg-white/10 text-gray-400'
                    }`}>
                      #{city.rank}
                    </span>
                    <div>
                      <div className="font-semibold">{city.city}</div>
                      <div className="text-[9px] text-gray-400">{city.activeUsers} active users</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[#00E5FF] font-bold">{city.totalPoints.toLocaleString()} pts</div>
                  </div>
                </div>
              ))
            ) : (
              leaderboardData.nationalUsers.map((user, idx) => (
                <div
                  key={user.userId}
                  className="flex items-center justify-between p-2.5 bg-[#071A24] rounded-xl border border-white/5 text-xs text-gray-300"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold bg-white/10 text-gray-400">
                      #{idx + 1}
                    </span>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-1">
                        <span>{user.name}</span>
                        <span className="text-[10px] text-gray-400">({user.city})</span>
                      </div>
                      <div className="text-[9px] text-[#FFD700]">{user.crown}</div>
                    </div>
                  </div>

                  <div className="text-[#00E5FF] font-bold">
                    {user.points} pts
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

    </div>
  );
}
