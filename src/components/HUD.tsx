import React from 'react';
import { Volume2, VolumeX, Trophy, Zap, RotateCcw } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface HUDProps {
  cycle: number;
  aliveCount: number;
  totalCount: number;
  top3: LeaderboardEntry[];
  isMuted: boolean;
  simulationSpeed: number;
  onToggleMute: () => void;
  onToggleSpeed: () => void;
  onOpenLeaderboard: () => void;
  onResetArena: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  cycle,
  aliveCount,
  totalCount,
  top3,
  isMuted,
  simulationSpeed,
  onToggleMute,
  onToggleSpeed,
  onOpenLeaderboard,
  onResetArena,
}) => {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex items-start justify-between select-none">
      {/* Top Left: Top 3 Leaderboard cluster */}
      <div className="pointer-events-auto flex flex-col gap-1.5 bg-slate-950/80 backdrop-blur-md border border-cyan-500/25 rounded-xl p-2.5 shadow-lg shadow-black/40 min-w-[130px] sm:min-w-[155px]">
        <button
          onClick={onOpenLeaderboard}
          className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-cyan-400 hover:text-cyan-300 transition-colors pb-1 border-b border-slate-800"
        >
          <span className="flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            Top Ranks
          </span>
          <span className="text-[10px] text-slate-400 font-normal">View All</span>
        </button>

        {top3.length === 0 ? (
          <div className="text-[11px] text-slate-500 py-1 italic">No wins yet</div>
        ) : (
          <div className="flex flex-col gap-1">
            {top3.map((entry, idx) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={entry.code}
                  className="flex items-center justify-between text-xs py-0.5 text-slate-200"
                >
                  <div className="flex items-center gap-1.5 truncate max-w-[95px] sm:max-w-[115px]">
                    <span className="text-[11px] shrink-0">{medals[idx] || `${idx + 1}.`}</span>
                    <span className="shrink-0">{entry.flag}</span>
                    <span className="font-semibold truncate">{entry.name}</span>
                  </div>
                  <span className="font-mono text-cyan-400 font-bold tabular-nums text-xs ml-1">
                    {entry.score}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Top Center: Cycle N and LIVE indicator */}
      <div className="flex flex-col items-center gap-1">
        <div className="flex items-center gap-2 bg-slate-950/85 backdrop-blur-md border border-slate-800 rounded-full px-3 py-1 shadow-md">
          {/* Pulsing LIVE badge */}
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
            <span className="text-[10px] font-extrabold tracking-widest text-red-500 uppercase">
              LIVE
            </span>
          </div>

          <span className="text-slate-600 text-xs">|</span>

          {/* Cycle number */}
          <div className="text-xs font-bold text-white tracking-wide font-sans">
            Cycle <span className="text-cyan-400 font-mono tabular-nums">{cycle}</span>
          </div>
        </div>

        {/* Alive status indicator */}
        <div className="bg-slate-900/75 border border-slate-800 rounded-lg px-2.5 py-0.5 text-[11px] text-slate-300 font-medium">
          <span className="text-emerald-400 font-bold tabular-nums font-mono">{aliveCount}</span>
          <span className="text-slate-500"> / </span>
          <span className="text-slate-400 tabular-nums font-mono">{totalCount}</span>
          <span className="text-slate-400 ml-1">Alive</span>
        </div>
      </div>

      {/* Top Right: Sound, Speed, Reset actions */}
      <div className="pointer-events-auto flex items-center gap-1.5 sm:gap-2 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-xl p-1.5 shadow-lg">
        {/* Speed toggle */}
        <button
          onClick={onToggleSpeed}
          title={`Speed: ${simulationSpeed}x`}
          aria-label="Toggle simulation speed"
          className={`px-2 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
            simulationSpeed > 1
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>{simulationSpeed}x</span>
        </button>

        {/* Audio Mute toggle */}
        <button
          onClick={onToggleMute}
          title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          aria-label="Toggle audio"
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Reset arena */}
        <button
          onClick={onResetArena}
          title="Reset Arena"
          aria-label="Reset arena"
          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
