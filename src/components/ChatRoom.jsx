import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare, Gamepad2, GraduationCap, Calendar, ShieldCheck, Zap, HelpCircle, CheckCircle2 } from 'lucide-react';

const CHANNELS = [
  { id: 'general', name: 'General Lounge', icon: MessageSquare, description: 'Hyper-local chatter & news' },
  { id: 'gaming', name: 'Gaming LFG', icon: Gamepad2, description: 'Find teammates & local squads' },
  { id: 'study', name: 'Study Groups', icon: GraduationCap, description: 'Peer support & local study notes' },
  { id: 'events', name: 'Local Events', icon: Calendar, description: 'Discover meetups & city contests' }
];

const TRIVIA_QUESTIONS = [
  { id: 1, question: "Which landmark is famously associated with NYC?", options: ["Statue of Liberty", "Big Ben", "Eiffel Tower", "Colosseum"], answer: 0 },
  { id: 2, question: "What does the Zynochat upward swoosh represent?", options: ["Growth & Success", "Sound waves", "Navigation", "WiFi Signal"], answer: 0 },
  { id: 3, question: "How many pillars define Zynochat philosophy?", options: ["3 (Connect, Compete, Conquer)", "2", "5", "4"], answer: 0 }
];

export default function ChatRoom({ socket, currentCity, activeChannel, setActiveChannel, user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [activeTrivia, setActiveTrivia] = useState(null);
  const [triviaResult, setTriviaResult] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!socket) return;

    // Join room when city or channel changes
    socket.emit('join_channel', {
      city: currentCity,
      channel: activeChannel,
      userId: user?.id,
      username: user?.username
    });

    const handleChatHistory = (history) => {
      setMessages(history);
    };

    const handleReceiveMessage = (msg) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleSystemMessage = (sysMsg) => {
      setMessages((prev) => [...prev, { ...sysMsg, isSystem: true }]);
    };

    socket.on('chat_history', handleChatHistory);
    socket.on('receive_message', handleReceiveMessage);
    socket.on('system_message', handleSystemMessage);

    return () => {
      socket.off('chat_history', handleChatHistory);
      socket.off('receive_message', handleReceiveMessage);
      socket.off('system_message', handleSystemMessage);
    };
  }, [socket, currentCity, activeChannel, user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || !socket) return;

    socket.emit('send_message', {
      city: currentCity,
      channel: activeChannel,
      userId: user?.id,
      username: user?.username,
      text: inputMessage.trim()
    });

    setInputMessage('');
  };

  const startLocalTrivia = () => {
    const q = TRIVIA_QUESTIONS[Math.floor(Math.random() * TRIVIA_QUESTIONS.length)];
    setActiveTrivia(q);
    setTriviaResult(null);
  };

  const handleAnswerTrivia = (optionIdx) => {
    if (!activeTrivia) return;
    const isCorrect = optionIdx === activeTrivia.answer;
    setTriviaResult(isCorrect ? 'Correct! +25 pts earned' : 'Incorrect, try again next time!');

    if (isCorrect && socket) {
      socket.emit('submit_trivia_answer', {
        userId: user?.id,
        isCorrect: true,
        pointsAwarded: 25
      });
    }

    setTimeout(() => {
      setActiveTrivia(null);
      setTriviaResult(null);
    }, 3000);
  };

  return (
    <div class="flex flex-col md:flex-row h-[calc(100vh-105px)] bg-zyno-dark overflow-hidden">

      {/* Channel Sidebar */}
      <div class="w-full md:w-64 bg-zyno-deep/90 border-r border-cyan-500/20 p-3 flex flex-col gap-2 shrink-0">
        <div class="px-2 py-1 text-[11px] font-extrabold uppercase text-cyan-400 tracking-wider flex items-center justify-between">
          <span>{currentCity} Channels</span>
          <span class="bg-cyan-950 text-cyan-300 text-[10px] px-1.5 rounded border border-cyan-500/30">
            Pillar 1: CONNECT
          </span>
        </div>

        <div class="flex md:flex-col gap-1.5 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {CHANNELS.map((ch) => {
            const IconComponent = ch.icon;
            const isActive = activeChannel === ch.id;
            return (
              <button
                key={ch.id}
                onClick={() => setActiveChannel(ch.id)}
                class={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition shrink-0 md:w-full text-left ${
                  isActive
                    ? 'bg-zyno-gradient text-white shadow-md border border-cyan-400/40'
                    : 'text-slate-300 hover:bg-cyan-900/30 hover:text-white'
                }`}
              >
                <IconComponent class={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-cyan-400'}`} />
                <div class="hidden sm:block">
                  <div class="font-bold leading-none">{ch.name}</div>
                  <div class="text-[10px] opacity-75 font-normal mt-0.5">{ch.description}</div>
                </div>
                <div class="sm:hidden font-bold">{ch.name}</div>
              </button>
            );
          })}
        </div>

        {/* Gamified Trivia Banner Widget */}
        <div class="mt-auto bg-gradient-to-br from-cyan-950/80 to-zyno-card p-3 rounded-xl border border-cyan-500/30 text-xs">
          <div class="flex items-center justify-between font-bold text-cyan-300 mb-1">
            <span class="flex items-center gap-1.5">
              <Zap class="w-4 h-4 text-amber-400 fill-amber-400" />
              City Trivia Quiz
            </span>
            <span class="text-[9px] bg-amber-400/20 text-amber-300 px-1 rounded font-mono">+25 PTS</span>
          </div>
          <p class="text-[11px] text-slate-300 mb-2">
            Compete in quick local trivia quizzes to boost your city leaderboard rank!
          </p>
          <button
            onClick={startLocalTrivia}
            class="w-full py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-200 font-bold rounded-lg text-xs transition"
          >
            Launch Trivia Challenge
          </button>
        </div>
      </div>

      {/* Main Real-Time Message Stream Area */}
      <div class="flex-1 flex flex-col bg-zyno-dark/80 relative">

        {/* Active Channel Header */}
        <div class="px-4 py-3 bg-zyno-card border-b border-cyan-500/20 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <h2 class="font-black text-sm text-white capitalize flex items-center gap-1.5">
              <span class="text-cyan-400">#</span> {activeChannel}
            </h2>
            <span class="text-xs text-slate-400 font-normal">in {currentCity}</span>
          </div>
          <div class="flex items-center gap-2 text-[11px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
            <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            WebSocket Live
          </div>
        </div>

        {/* Trivia Challenge Modal/Banner overlay if active */}
        {activeTrivia && (
          <div class="bg-gradient-to-r from-amber-950/90 via-cyan-950/90 to-amber-950/90 border-b border-amber-500/40 p-4 text-xs z-10 animate-fade-in shadow-xl">
            <div class="flex items-center gap-2 font-bold text-amber-300 mb-2">
              <HelpCircle class="w-4 h-4" />
              <span>Local Trivia Challenge: {activeTrivia.question}</span>
            </div>
            <div class="grid grid-cols-2 gap-2">
              {activeTrivia.options.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerTrivia(idx)}
                  class="py-1.5 px-3 bg-black/40 hover:bg-cyan-900/60 border border-cyan-500/30 text-slate-200 rounded-lg font-semibold text-left transition"
                >
                  {opt}
                </button>
              ))}
            </div>
            {triviaResult && (
              <div class="mt-2 text-center font-bold text-cyan-300 animate-pulse">
                {triviaResult}
              </div>
            )}
          </div>
        )}

        {/* Message Stream */}
        <div class="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div class="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <MessageSquare class="w-12 h-12 text-cyan-500/30 mb-2" />
              <p class="font-bold text-slate-400 text-sm">No messages yet in #{activeChannel}</p>
              <p class="text-xs text-slate-500 max-w-xs mt-1">
                Be the first local community member to break the silence and start earning chat activity points!
              </p>
            </div>
          ) : (
            messages.map((msg) => {
              if (msg.isSystem) {
                return (
                  <div key={msg.id} class="text-center py-1">
                    <span class="text-[10px] font-medium bg-cyan-950/40 text-cyan-300/80 px-2.5 py-1 rounded-full border border-cyan-500/10">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              const isMe = msg.userId === user?.id;

              return (
                <div
                  key={msg.id}
                  class={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div class="flex items-center gap-1.5 mb-0.5 px-1">
                    <span class="text-[11px] font-bold text-cyan-200">
                      {msg.username}
                    </span>
                    {msg.userVerified && (
                      <span class="text-[9px] bg-emerald-950 text-emerald-400 px-1 rounded border border-emerald-500/30 flex items-center gap-0.5">
                        <ShieldCheck class="w-2.5 h-2.5" />
                        Verified
                      </span>
                    )}
                    <span class="text-[9px] text-slate-500">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div
                    class={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-md ${
                      isMe
                        ? 'bg-zyno-gradient text-white rounded-tr-none border border-cyan-400/30'
                        : 'bg-zyno-card text-slate-100 rounded-tl-none border border-slate-700/60'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSendMessage} class="p-3 bg-zyno-card border-t border-cyan-500/20 flex gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={`Message #${activeChannel} in ${currentCity}... (+5 pts)`}
            class="flex-1 bg-zyno-dark/90 border border-cyan-500/30 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim()}
            class="bg-zyno-cyan-glow text-zinc-950 px-4 py-2.5 rounded-xl font-extrabold hover:brightness-110 transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 text-xs shadow-md shadow-cyan-500/20"
          >
            <span>Send</span>
            <Send class="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
