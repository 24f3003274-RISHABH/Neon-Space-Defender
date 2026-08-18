import React from 'react';
import { RotateCcw, Home, Award, Target, Crosshair, Skull } from 'lucide-react';
import { GameStats } from '../types';

interface GameOverModalProps {
  stats: GameStats;
  onRestart: () => void;
  onHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ stats, onRestart, onHome }) => {
  const isNewHighScore = stats.score > 0 && stats.score >= stats.highScore;

  return (
    <div id="game-over-modal" className="absolute inset-0 z-30 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#050508]/90 backdrop-blur-xl animate-in fade-in duration-300">
      <div className="w-full max-w-md bg-[#0a0c16]/95 border border-[#ff005588] rounded-2xl p-5 sm:p-6 flex flex-col items-center text-center shadow-[0_0_45px_rgba(255,0,85,0.35)] relative overflow-hidden">
        {/* Top Glow Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#ff0055] via-[#ff00ff] to-[#ff0055] shadow-[0_0_15px_#ff0055]" />

        {/* Header */}
        <div className="flex items-center gap-2 text-[#ff0055] mb-1">
          <Skull size={18} className="animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase font-bold">HULL DESTROYED // SIGNAL LOST</span>
        </div>

        <h2 className="text-3xl sm:text-4xl font-black italic font-arcade text-transparent bg-clip-text bg-gradient-to-r from-white via-red-200 to-[#ff0055] tracking-wider drop-shadow-[0_0_20px_rgba(255,0,85,0.7)]">
          MISSION FAILED
        </h2>

        {/* New High Score Alert */}
        {isNewHighScore ? (
          <div className="mt-2 inline-flex items-center gap-2 px-3.5 py-1 bg-[#ff00ff22] border border-[#ff00ff] rounded-full text-xs text-[#ff00ff] font-mono tracking-wider animate-pulse shadow-[0_0_15px_rgba(255,0,255,0.4)]">
            <Award size={15} className="text-[#ff00ff]" />
            <span>★ NEW HIGH RECORD ACHIEVED! ★</span>
          </div>
        ) : (
          <div className="mt-1.5 text-xs font-mono text-slate-400 tracking-wider">
            RECORD BEST: <span className="text-[#ff00ff] font-bold">{stats.highScore.toLocaleString()}</span>
          </div>
        )}

        {/* Final Score Display */}
        <div className="my-4 flex flex-col items-center">
          <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest font-mono">FINAL SCORE</span>
          <span className="text-4xl sm:text-5xl font-black font-mono text-white tracking-widest drop-shadow-[0_0_20px_rgba(0,243,255,0.7)]">
            {stats.score.toLocaleString()}
          </span>
        </div>

        {/* Detailed Combat Performance Grid */}
        <div className="w-full grid grid-cols-2 gap-2 p-3 bg-[#050508]/80 border border-slate-800 rounded-xl mb-5 text-left">
          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <Target size={11} className="text-[#00f3ff]" /> Sector Reached
            </span>
            <span className="text-base font-mono font-bold text-[#00f3ff]">
              Sector {stats.wave}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 font-mono">
              <Crosshair size={11} className="text-[#ff00ff]" /> Hostiles Slain
            </span>
            <span className="text-base font-mono font-bold text-[#ff00ff]">
              {stats.enemiesDestroyed}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Firing Accuracy
            </span>
            <span className="text-base font-mono font-bold text-amber-300">
              {stats.accuracy}%
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider font-mono">
              Bosses Slain
            </span>
            <span className="text-base font-mono font-bold text-emerald-400">
              {stats.bossDefeated}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col sm:flex-row gap-2.5">
          <button
            id="btn-restart-game"
            onClick={onRestart}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[#00f3ff] to-[#0088ff] hover:opacity-95 text-slate-950 font-mono font-bold text-xs sm:text-sm tracking-wider shadow-[0_0_15px_rgba(0,243,255,0.5)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <RotateCcw size={15} />
            <span>RE-ENGAGE FLEET</span>
          </button>

          <button
            id="btn-return-hangar"
            onClick={onHome}
            className="py-3 px-4 rounded-xl bg-[#050508] hover:bg-slate-900 border border-slate-700 text-slate-200 font-mono text-xs tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Home size={14} />
            <span>HANGAR</span>
          </button>
        </div>
      </div>
    </div>
  );
};
