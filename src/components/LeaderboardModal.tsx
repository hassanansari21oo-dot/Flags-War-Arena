import React, { useState } from 'react';
import { X, Trophy, Search, RotateCcw } from 'lucide-react';
import { LeaderboardEntry } from '../types/game';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaderboard: LeaderboardEntry[];
  onResetLeaderboard: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  leaderboard,
  onResetLeaderboard,
}) => {
  const [search, setSearch] = useState('');
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  if (!isOpen) return null;

  const filtered = leaderboard.filter((entry) =>
    entry.name.toLowerCase().includes(search.toLowerCase()) ||
    entry.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-md bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">Arena Leaderboard</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-slate-800/60">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search country in rankings..."
              className="w-full bg-slate-900 text-sm text-white placeholder-slate-400 pl-9 pr-3 py-2 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4 divide-y divide-slate-800/50">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-slate-500 text-sm">
              {leaderboard.length === 0 ? 'No wins recorded yet! Start a battle.' : 'No countries found.'}
            </div>
          ) : (
            filtered.map((entry, index) => {
              const medals = ['🥇', '🥈', '🥉'];
              return (
                <div
                  key={entry.code}
                  className="flex items-center justify-between py-2.5 px-2 hover:bg-slate-900/50 rounded-lg transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-slate-400 w-6 text-center">
                      {medals[index] || `${index + 1}.`}
                    </span>
                    <span className="text-2xl">{entry.flag}</span>
                    <div>
                      <div className="text-sm font-semibold text-white">{entry.name}</div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        {entry.code} · {entry.participations} {entry.participations === 1 ? 'cycle' : 'cycles'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-base font-bold text-cyan-400 font-mono tabular-nums">
                      {entry.score}
                    </span>
                    <span className="text-xs text-slate-400 ml-1">pts</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          {showConfirmReset ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-rose-300">Clear scores?</span>
              <button
                onClick={() => {
                  onResetLeaderboard();
                  setShowConfirmReset(false);
                }}
                className="px-2.5 py-1 text-xs font-bold text-rose-300 bg-rose-950/80 hover:bg-rose-900 rounded-lg border border-rose-500/50"
              >
                Yes, Reset
              </button>
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowConfirmReset(true)}
              className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Scores</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
