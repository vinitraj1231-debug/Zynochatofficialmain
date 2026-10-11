import React, { useState } from 'react';
import { ShieldCheck, MapPin, AlertCircle, CheckCircle2, Crosshair } from 'lucide-react';

export default function LocationModal({ isOpen, onClose, currentCity, userId, onVerifySuccess }) {
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSimulateGPS = async (overrideCoords = null) => {
    setLoading(true);
    setErrorMsg(null);
    setVerificationResult(null);

    let lat, lng;

    if (overrideCoords) {
      lat = overrideCoords.lat;
      lng = overrideCoords.lng;
    } else if (navigator.geolocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
        });
        lat = position.coords.latitude;
        lng = position.coords.longitude;
      } catch (err) {
        // Fallback simulation near current city if browser denies or times out
        console.warn('Geolocation fallback activated:', err.message);
        lat = 40.7128; // Default to NYC center coords for test
        lng = -74.0060;
      }
    } else {
      lat = 40.7128;
      lng = -74.0060;
    }

    try {
      const res = await fetch('/api/verify-location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          targetCity: currentCity,
          latitude: lat,
          longitude: lng
        })
      });

      const data = await res.json();
      if (res.ok) {
        setVerificationResult(data);
        if (data.verified) {
          onVerifySuccess(data);
        }
      } else {
        setErrorMsg(data.error || 'Verification failed');
      }
    } catch (err) {
      setErrorMsg('Network error while verifying location');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-zyno-card border border-cyan-500/40 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          class="absolute top-4 right-4 text-slate-400 hover:text-white text-lg font-bold"
        >
          ✕
        </button>

        <div class="flex items-center gap-3 mb-4">
          <div class="p-3 bg-cyan-950/80 rounded-xl border border-cyan-500/30 text-cyan-400">
            <ShieldCheck class="w-6 h-6" />
          </div>
          <div>
            <h3 class="text-lg font-bold text-white">City Location Verification</h3>
            <p class="text-xs text-slate-400">Anti-Spoofing Fair Play Protocol</p>
          </div>
        </div>

        <p class="text-xs text-slate-300 mb-5 leading-relaxed">
          Zynochat enforces fair competition on local leaderboards and chat channels. Verify your proximity to <strong class="text-cyan-300">{currentCity}</strong> (within 50 km) to earn the <span class="text-emerald-400 font-semibold">Verified Local</span> badge and +50 bonus points!
        </p>

        {verificationResult && (
          <div className={`p-4 rounded-xl border mb-5 ${
            verificationResult.verified
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
              : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
          }`}>
            <div class="flex items-center gap-2 font-bold mb-1">
              {verificationResult.verified ? (
                <>
                  <CheckCircle2 class="w-5 h-5 text-emerald-400" />
                  <span>Verification Successful!</span>
                </>
              ) : (
                <>
                  <AlertCircle class="w-5 h-5 text-rose-400" />
                  <span>Out of City Bounds</span>
                </>
              )}
            </div>
            <p class="text-xs opacity-90">
              Your location is <strong>{verificationResult.distanceKm} km</strong> from {currentCity} center (Max allowed: {verificationResult.maxRadiusKm} km).
            </p>
          </div>
        )}

        {errorMsg && (
          <div class="p-3 bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs rounded-xl mb-5">
            {errorMsg}
          </div>
        )}

        <div class="space-y-3">
          <button
            onClick={() => handleSimulateGPS()}
            disabled={loading}
            class="w-full py-3 bg-zyno-cyan-glow text-zinc-950 font-black rounded-xl hover:brightness-110 transition flex items-center justify-center gap-2 text-sm shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <Crosshair class="w-4 h-4" />
            {loading ? 'Verifying Coordinates...' : `Verify GPS Proximity for ${currentCity}`}
          </button>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-700"></div>
            <span class="flex-shrink mx-2 text-[10px] text-slate-500 font-bold uppercase">Demo GPS Simulator</span>
            <div class="flex-grow border-t border-slate-700"></div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleSimulateGPS({ lat: 40.7128, lng: -74.0060 })}
              class="py-2 px-3 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-500/30 text-cyan-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <MapPin class="w-3 h-3 text-cyan-400" />
              Simulate In-City
            </button>
            <button
              onClick={() => handleSimulateGPS({ lat: 37.7749, lng: -122.4194 })}
              class="py-2 px-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 rounded-lg text-xs font-semibold flex items-center justify-center gap-1"
            >
              <MapPin class="w-3 h-3 text-rose-400" />
              Simulate Distant
            </button>
          </div>
        </div>

        <div class="mt-5 text-center">
          <button onClick={onClose} class="text-xs text-slate-400 hover:text-white underline">
            Close Modal
          </button>
        </div>
      </div>
    </div>
  );
}
