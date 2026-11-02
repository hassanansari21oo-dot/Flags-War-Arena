import React, { useState, useRef, useEffect } from 'react';
import { Search, Plus, Sparkles, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Country } from '../types/game';
import { COUNTRIES, searchCountries, findCountry } from '../data/countries';

interface CountryInputProps {
  onAddCountry: (country: Country) => boolean;
  onStart30Random: () => void;
  onAddRandomN: (count: number) => void;
  isCountryActive: (code: string) => boolean;
  activeCount: number;
}

export const CountryInput: React.FC<CountryInputProps> = ({
  onAddCountry,
  onStart30Random,
  onAddRandomN,
  isCountryActive,
  activeCount,
}) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [suggestions, setSuggestions] = useState<Country[]>([]);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Update suggestions on query change
  useEffect(() => {
    if (query.trim().length > 0) {
      setSuggestions(searchCountries(query, 7));
    } else {
      setSuggestions([]);
    }
  }, [query]);

  // Click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCountry = (country: Country) => {
    if (isCountryActive(country.code)) {
      setFeedback({
        type: 'error',
        message: `${country.flag} ${country.name} is already in the arena!`,
      });
      setTimeout(() => setFeedback(null), 2500);
      return;
    }

    const added = onAddCountry(country);
    if (added) {
      setFeedback({
        type: 'success',
        message: `${country.flag} ${country.name} entered the battle!`,
      });
      setQuery('');
      setIsFocused(false);
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Check exact or first match
    const matched = findCountry(query) || suggestions[0];
    if (matched) {
      handleSelectCountry(matched);
    } else {
      setFeedback({
        type: 'error',
        message: `Country "${query}" not found. Try another!`,
      });
      setTimeout(() => setFeedback(null), 2500);
    }
  };

  return (
    <div
      ref={containerRef}
      className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none p-3 sm:p-4 flex flex-col items-center gap-2 select-none"
    >
      {/* Toast Feedback banner */}
      {feedback && (
        <div
          className={`pointer-events-auto flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-md transition-all animate-bounce ${
            feedback.type === 'error'
              ? 'bg-rose-950/90 text-rose-300 border border-rose-500/40'
              : 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {feedback.type === 'error' ? (
            <AlertCircle className="w-3.5 h-3.5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Autocomplete popup suggestions */}
      {isFocused && suggestions.length > 0 && (
        <div className="pointer-events-auto w-full max-w-md bg-slate-950/95 backdrop-blur-md border border-cyan-500/30 rounded-xl overflow-hidden shadow-2xl shadow-cyan-950/50 mb-1 max-h-56 overflow-y-auto divide-y divide-slate-800/60">
          {suggestions.map((c) => {
            const alreadyIn = isCountryActive(c.code);
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelectCountry(c)}
                className={`w-full px-3.5 py-2.5 flex items-center justify-between text-left transition-colors ${
                  alreadyIn
                    ? 'opacity-40 bg-slate-900/40 cursor-not-allowed'
                    : 'hover:bg-cyan-950/40 active:bg-cyan-900/50 cursor-pointer'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl shrink-0">{c.flag}</span>
                  <div>
                    <div className="text-sm font-semibold text-white">{c.name}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{c.code}</div>
                  </div>
                </div>
                {alreadyIn ? (
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded">
                    Active
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-cyan-400 flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    Drop
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Main Bottom Controls Strip */}
      <div className="pointer-events-auto w-full max-w-md flex flex-col gap-2">
        {/* Input box */}
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            <Search className="w-4 h-4 text-cyan-400" />
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            placeholder="Where are you from? (e.g. France, Japan...)"
            className="w-full bg-slate-950/90 text-white placeholder-slate-400 text-sm pl-9 pr-24 py-2.5 rounded-xl border border-cyan-500/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 backdrop-blur-md shadow-lg shadow-black/60 transition-all font-sans"
          />

          <button
            type="submit"
            disabled={!query.trim()}
            className="absolute right-1.5 px-3 py-1.5 text-xs font-bold text-black bg-cyan-400 hover:bg-cyan-300 disabled:opacity-40 disabled:hover:bg-cyan-400 rounded-lg shadow transition-all uppercase tracking-wider flex items-center gap-1 active:scale-95"
          >
            <Plus className="w-3 h-3 stroke-[3]" />
            Drop
          </button>
        </form>

        {/* Action Buttons row: "Start with 30 random flags" & "+5 Random" */}
        <div className="flex items-center gap-2">
          <button
            onClick={onStart30Random}
            type="button"
            className="flex-1 py-2 px-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:via-blue-500 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 border border-cyan-300/30 tracking-wide"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-200 fill-cyan-200" />
            <span>Start with 30 Random Flags</span>
          </button>

          <button
            onClick={() => onAddRandomN(5)}
            type="button"
            className="py-2 px-3 bg-slate-900/90 hover:bg-slate-800 text-cyan-300 font-bold text-xs rounded-xl border border-slate-700/80 shadow-md active:scale-95 transition-all shrink-0 flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+5 Random</span>
          </button>
        </div>
      </div>
    </div>
  );
};
