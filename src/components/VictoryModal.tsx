import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, FastForward, Crown } from 'lucide-react';
import { FlagPlayer } from '../types/game';
import { sound } from '../utils/audio';

interface VictoryModalProps {
  winner: FlagPlayer;
  cycle: number;
  onNextCycle: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  winner,
  cycle,
  onNextCycle,
}) => {
  const [countdown, setCountdown] = useState(5);
  const hasTriggeredRef = React.useRef(false);

  useEffect(() => {
    // Play fanfare
    sound.playVictory();

    // Trigger colorful confetti shower
    confetti({
      particleCount: 75,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#00f0ff', '#a855f7', '#fbbf24', '#f43f5e', '#ffffff'],
    });

    const timer = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (countdown <= 0 && !hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      onNextCycle();
    }
  }, [countdown, onNextCycle]);

  const handleManualNext = () => {
    if (!hasTriggeredRef.current) {
      hasTriggeredRef.current = true;
      onNextCycle();
    }
  };

  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in select-none">
      <div className="w-full max-w-sm bg-gradient-to-b from-slate-900 via-slate-950 to-[#070b1a] border-2 border-cyan-400/60 rounded-2xl p-6 shadow-2xl shadow-cyan-500/20 text-center relative overflow-hidden">
        {/* Glow ambient background aura */}
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Crown & Flag Trophy Lockup */}
        <div className="relative inline-block mb-3">
          <div className="text-6xl sm:text-7xl animate-bounce filter drop-shadow-[0_0_20px_rgba(34,211,238,0.6)]">
            {winner.flag}
          </div>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 p-1 rounded-full shadow-lg">
            <Crown className="w-5 h-5 fill-slate-950" />
          </div>
        </div>

        {/* Winner Announcement */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-extrabold uppercase tracking-widest mb-1.5">
          <Trophy className="w-3.5 h-3.5 text-amber-400" />
          <span>Cycle {cycle} Champion</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-1">
          {winner.name}
        </h2>

        <p className="text-sm font-semibold text-emerald-400 mb-5 flex items-center justify-center gap-1">
          <span>+1 Point added to Leaderboard</span>
        </p>

        {/* 5-second countdown progress bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-slate-400 font-medium mb-1.5 px-1">
            <span>Next cycle starts in</span>
            <span className="font-mono font-bold text-cyan-400 tabular-nums">
              {countdown}s
            </span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700/60">
            <div
              className="bg-gradient-to-r from-cyan-400 to-purple-500 h-full rounded-full transition-all duration-1000 ease-linear"
              style={{ width: `${(countdown / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Immediate Next Cycle CTA */}
        <button
          onClick={handleManualNext}
          className="w-full py-3 px-4 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 active:scale-[0.98] text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider"
        >
          <FastForward className="w-4 h-4 fill-slate-950" />
          <span>Start Next Cycle Now</span>
        </button>
      </div>
    </div>
  );
};
