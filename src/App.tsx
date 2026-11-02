/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FlagsPhysicsEngine } from './game/physicsEngine';
import { Country, FlagPlayer, LeaderboardEntry } from './types/game';
import { COUNTRIES } from './data/countries';
import { sound } from './utils/audio';
import { HUD } from './components/HUD';
import { CountryInput } from './components/CountryInput';
import { VictoryModal } from './components/VictoryModal';
import { LeaderboardModal } from './components/LeaderboardModal';

const LEADERBOARD_STORAGE_KEY = 'flags_arena_leaderboard_v1';
const CYCLE_STORAGE_KEY = 'flags_arena_cycle_v1';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<FlagsPhysicsEngine | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Game state
  const [cycle, setCycle] = useState<number>(() => {
    const saved = localStorage.getItem(CYCLE_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 1;
  });
  const [aliveCount, setAliveCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(() => sound.getMuted());
  const [simulationSpeed, setSimulationSpeed] = useState<number>(1.0);
  const [winner, setWinner] = useState<FlagPlayer | null>(null);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [lastRoster, setLastRoster] = useState<Country[]>([]);
  const [recentElimination, setRecentElimination] = useState<string | null>(null);

  // Leaderboard data
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // Save leaderboard & cycle
  useEffect(() => {
    localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem(CYCLE_STORAGE_KEY, String(cycle));
  }, [cycle]);

  // Record a win in the leaderboard
  const recordWin = useCallback((winningPlayer: FlagPlayer) => {
    setLeaderboard((prev) => {
      const existing = prev.find((e) => e.code === winningPlayer.code);
      let updated: LeaderboardEntry[];
      if (existing) {
        updated = prev.map((e) =>
          e.code === winningPlayer.code
            ? { ...e, score: e.score + 1, participations: e.participations + 1 }
            : e
        );
      } else {
        updated = [
          ...prev,
          {
            code: winningPlayer.code,
            name: winningPlayer.name,
            flag: winningPlayer.flag,
            score: 1,
            participations: 1,
          },
        ];
      }
      return updated.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    });
  }, []);

  // Top 3 for the HUD
  const top3 = leaderboard.slice(0, 3);

  // Initialize Canvas and Matter.js Engine
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.scale(dpr, dpr);

      if (engineRef.current) {
        engineRef.current.resize(width, height);
      }
    };

    const initialW = window.innerWidth;
    const initialH = window.innerHeight;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = initialW * dpr;
    canvas.height = initialH * dpr;
    canvas.style.width = `${initialW}px`;
    canvas.style.height = `${initialH}px`;
    ctx.scale(dpr, dpr);

    const engine = new FlagsPhysicsEngine(initialW, initialH);
    engineRef.current = engine;

    // Callbacks from physics engine
    engine.onEliminated = (eliminatedPlayer, remaining) => {
      setAliveCount(remaining);
      setRecentElimination(`${eliminatedPlayer.flag} ${eliminatedPlayer.name} eliminated! (${remaining} left)`);
      setTimeout(() => {
        setRecentElimination((prev) =>
          prev?.startsWith(eliminatedPlayer.flag) ? null : prev
        );
      }, 2500);
    };

    engine.onRoundWon = (winningPlayer) => {
      setWinner(winningPlayer);
      recordWin(winningPlayer);
    };

    window.addEventListener('resize', handleResize);

    // Main 60fps Loop
    let running = true;
    lastTimeRef.current = performance.now();

    const renderLoop = (time: number) => {
      if (!running) return;
      const dt = (time - lastTimeRef.current) / 1000;
      lastTimeRef.current = time;

      // Update physics and particles
      engine.update(dt);

      // Render to canvas
      ctx.save();
      engine.render(ctx);
      ctx.restore();

      animationFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animationFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, [recordWin]);

  // Sync alive count periodically or on player changes
  const syncPlayerCounts = useCallback(() => {
    if (engineRef.current) {
      const alive = engineRef.current.getAlivePlayers().length;
      const total = engineRef.current.players.size;
      setAliveCount(alive);
      setTotalCount(total);
    }
  }, []);

  // Handler: Add a country from input
  const handleAddCountry = useCallback((country: Country): boolean => {
    if (!engineRef.current) return false;
    const added = engineRef.current.addPlayer(country);
    if (added) {
      setLastRoster((prev) => {
        if (!prev.some((c) => c.code === country.code)) {
          return [...prev, country];
        }
        return prev;
      });
      syncPlayerCounts();
    }
    return added;
  }, [syncPlayerCounts]);

  // Handler: Start with 30 random flags
  const handleStart30Random = useCallback(() => {
    if (!engineRef.current) return;
    setWinner(null);

    // Pick 30 unique random countries
    const shuffled = [...COUNTRIES].sort(() => Math.random() - 0.5).slice(0, 30);
    setLastRoster(shuffled);

    engineRef.current.addMultiple(shuffled, true);
    setTotalCount(30);
    setAliveCount(30);
  }, []);

  // Handler: Add N random flags
  const handleAddRandomN = useCallback((count: number) => {
    if (!engineRef.current) return;
    const currentActiveCodes = new Set(
      engineRef.current.getAlivePlayers().map((p) => p.code)
    );

    const available = COUNTRIES.filter((c) => !currentActiveCodes.has(c.code));
    const selection = [...available].sort(() => Math.random() - 0.5).slice(0, count);

    engineRef.current.addMultiple(selection, false);
    setLastRoster((prev) => [...prev, ...selection]);
    setTimeout(syncPlayerCounts, count * 50 + 100);
  }, [syncPlayerCounts]);

  // Check if a country is active
  const isCountryActive = useCallback((code: string) => {
    return engineRef.current?.isCountryActive(code) ?? false;
  }, []);

  // Handler: Next cycle
  const handleNextCycle = useCallback(() => {
    setWinner(null);
    setCycle((prev) => prev + 1);

    if (!engineRef.current) return;

    // If we have a previous roster with at least 2 countries, respawn them for the next cycle
    if (lastRoster.length >= 2) {
      engineRef.current.addMultiple(lastRoster, true);
      setTotalCount(lastRoster.length);
      setAliveCount(lastRoster.length);
    } else {
      // Otherwise spawn a fresh batch of 30 random flags!
      const fresh30 = [...COUNTRIES].sort(() => Math.random() - 0.5).slice(0, 30);
      setLastRoster(fresh30);
      engineRef.current.addMultiple(fresh30, true);
      setTotalCount(30);
      setAliveCount(30);
    }
  }, [lastRoster]);

  // Handler: Reset arena
  const handleResetArena = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.clearAllFlags();
      setAliveCount(0);
      setTotalCount(0);
      setWinner(null);
    }
  }, []);

  // Handler: Toggle speed
  const handleToggleSpeed = useCallback(() => {
    setSimulationSpeed((prev) => {
      const next = prev === 1.0 ? 1.5 : 1.0;
      engineRef.current?.setSimulationSpeed(next);
      return next;
    });
  }, []);

  // Handler: Toggle mute
  const handleToggleMute = useCallback(() => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  }, []);

  // Handler: Reset Leaderboard
  const handleResetLeaderboard = useCallback(() => {
    setLeaderboard([]);
    localStorage.removeItem(LEADERBOARD_STORAGE_KEY);
  }, []);

  // On first mount, auto-populate with 30 flags if arena is empty
  useEffect(() => {
    const timer = setTimeout(() => {
      if (engineRef.current && engineRef.current.players.size === 0) {
        handleStart30Random();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [handleStart30Random]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#060914] text-white font-sans select-none touch-none">
      {/* 2D HTML Canvas for Matter.js physics simulation */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 block w-full h-full cursor-default"
      />

      {/* Top HUD Cluster (Top 3, Cycle N, LIVE, Sound/Speed/Reset) */}
      <HUD
        cycle={cycle}
        aliveCount={aliveCount}
        totalCount={totalCount}
        top3={top3}
        isMuted={isMuted}
        simulationSpeed={simulationSpeed}
        onToggleMute={handleToggleMute}
        onToggleSpeed={handleToggleSpeed}
        onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
        onResetArena={handleResetArena}
      />

      {/* Elimination Toast Alert ticker at mid-top */}
      {recentElimination && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-20 pointer-events-none transition-all duration-300">
          <div className="bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs font-semibold px-3 py-1 rounded-full shadow-lg backdrop-blur-md flex items-center gap-1.5 animate-pulse">
            <span>{recentElimination}</span>
          </div>
        </div>
      )}

      {/* Empty Arena Prompt if no flags are active */}
      {aliveCount === 0 && !winner && (
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center pointer-events-none p-4">
          <div className="bg-slate-950/85 backdrop-blur-md border border-cyan-500/30 rounded-2xl p-6 text-center max-w-xs shadow-2xl pointer-events-auto">
            <div className="text-3xl mb-2">⚔️</div>
            <h1 className="text-xl font-black text-white tracking-tight mb-1">
              FLAGS WAR ARENA
            </h1>
            <p className="text-xs text-slate-400 mb-4">
              Enter your country or start with 30 nations to watch the physics showdown!
            </p>
            <button
              onClick={handleStart30Random}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-cyan-400 to-purple-600 hover:from-cyan-300 hover:to-purple-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-95 transition-all uppercase tracking-wider"
            >
              Start Battle (30 Flags)
            </button>
          </div>
        </div>
      )}

      {/* Bottom Bar: Country Search & "Where are you from?" Input */}
      <CountryInput
        onAddCountry={handleAddCountry}
        onStart30Random={handleStart30Random}
        onAddRandomN={handleAddRandomN}
        isCountryActive={isCountryActive}
        activeCount={aliveCount}
      />

      {/* Victory Celebration Modal */}
      {winner && (
        <VictoryModal
          winner={winner}
          cycle={cycle}
          onNextCycle={handleNextCycle}
        />
      )}

      {/* Full Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        leaderboard={leaderboard}
        onResetLeaderboard={handleResetLeaderboard}
      />
    </div>
  );
}
