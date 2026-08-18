import React from 'react';
import { Heart, Volume2, VolumeX, Music, Pause, Play, Bomb, Shield, Zap, Flame, Star } from 'lucide-react';
import { GameStats, GameState } from '../types';

interface GameHUDProps {
  stats: GameStats;
  gameState: GameState;
  onPauseToggle: () => void;
  onUseBomb: () => void;
  sfxOn: boolean;
  musicOn: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  volume: number;
  onChangeVolume: (vol: number) => void;
}

export const GameHUD: React.FC<GameHUDProps> = ({
  stats,
  gameState,
  onPauseToggle,
  onUseBomb,
  sfxOn,
  musicOn,
  onToggleSfx,
  onToggleMusic,
}) => {
  return (
    <div id="game-hud-overlay" className="absolute inset-0 pointer-events-none flex flex-col justify-between p-3 sm:p-5 select-none z-10">
      {/* Top Header Row */}
      <div className="flex items-start justify-between w-full">
        {/* Score & High Score */}
        <div className="flex flex-col gap-0.5">
          <div className="flex items-baseline gap-2">
            <span className="text-[10px] text-[#00f3ff] font-mono tracking-widest uppercase opacity-80">SCORE</span>
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-wider tabular-nums drop-shadow-[0_0_12px_rgba(0,243,255,0.7)]">
              {stats.score.toLocaleString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span className="text-[#ff00ff] font-bold uppercase tracking-wider text-[10px]">HI-SCORE</span>
            <span className="font-mono text-[#ff00ff] opacity-90 tracking-wider">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Center: Wave Indicator */}
        <div className="flex flex-col items-center">
          <div className="px-3 py-1 bg-[#050508]/85 border border-[#00f3ff66] rounded-md backdrop-blur-md shadow-[0_0_15px_rgba(0,243,255,0.25)]">
            <span className="text-xs text-[#00f3ff] font-bold tracking-widest uppercase font-mono">
              WAVE {stats.wave}
            </span>
          </div>
          {stats.bossDefeated > 0 && (
            <span className="text-[9px] text-[#ff00ff] font-bold mt-1 font-mono tracking-wider">
              BOSSES DOWN: {stats.bossDefeated}
            </span>
          )}
        </div>

        {/* Right: Audio & Pause Controls (Mobile / Small View) */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            id="btn-toggle-sfx"
            onClick={onToggleSfx}
            title={sfxOn ? "Mute SFX" : "Unmute SFX"}
            className={`p-2 rounded-lg border transition-all ${
              sfxOn
                ? 'bg-[#00f3ff1a] border-[#00f3ff] text-[#00f3ff] shadow-[0_0_8px_rgba(0,243,255,0.3)] hover:bg-[#00f3ff33]'
                : 'bg-[#0a0c16]/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            {sfxOn ? <Volume2 size={15} /> : <VolumeX size={15} />}
          </button>

          <button
            id="btn-toggle-music"
            onClick={onToggleMusic}
            title={musicOn ? "Mute BGM" : "Unmute BGM"}
            className={`p-2 rounded-lg border transition-all ${
              musicOn
                ? 'bg-[#ff00ff1a] border-[#ff00ff] text-[#ff00ff] shadow-[0_0_8px_rgba(255,0,255,0.3)] hover:bg-[#ff00ff33]'
                : 'bg-[#0a0c16]/80 border-slate-800 text-slate-500 hover:text-slate-300'
            }`}
          >
            <Music size={15} />
          </button>

          <button
            id="btn-pause-game"
            onClick={onPauseToggle}
            title="Pause (P / Esc)"
            className="p-2 rounded-lg bg-[#0a0c16]/80 border border-slate-700 text-slate-200 hover:border-[#00f3ff] hover:text-[#00f3ff] transition-all"
          >
            {gameState === 'PAUSED' ? <Play size={15} /> : <Pause size={15} />}
          </button>
        </div>
      </div>

      {/* Center Left: Active Power-up Buff Timers (Small viewports) */}
      <div className="flex flex-col gap-1.5 max-w-[150px] lg:hidden">
        {stats.activeBuffs.map((buff) => {
          const percent = (buff.timeLeft / buff.maxDuration) * 100;
          return (
            <div
              key={buff.type}
              className="px-2 py-1 rounded-md bg-[#050508]/90 border backdrop-blur-md flex flex-col gap-1 transition-all"
              style={{ borderColor: buff.color, boxShadow: `0 0 10px ${buff.color}33` }}
            >
              <div className="flex items-center justify-between text-[10px] font-bold font-arcade tracking-wider">
                <span className="flex items-center gap-1" style={{ color: buff.color }}>
                  {buff.type === 'SHIELD' && <Shield size={11} />}
                  {buff.type === 'TRIPLE_SHOT' && <Flame size={11} />}
                  {buff.type === 'RAPID_FIRE' && <Zap size={11} />}
                  {buff.type === 'SCORE_BOOST' && <Star size={11} />}
                  {buff.label}
                </span>
                <span className="text-white text-[9px] font-mono">
                  {buff.timeLeft.toFixed(1)}s
                </span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-75"
                  style={{ width: `${percent}%`, backgroundColor: buff.color }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Row: Lives, EMP Bomb, and Status */}
      <div className="flex items-end justify-between w-full">
        {/* Lives Counter */}
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            HULL INTEGRITY
          </span>
          <div className="flex items-center gap-1.5">
            {Array.from({ length: stats.maxLives }).map((_, i) => (
              <div
                key={i}
                className={`p-1.5 rounded-sm border transition-all duration-300 ${
                  i < stats.lives
                    ? 'bg-[#00f3ff22] border-[#00f3ff] text-[#00f3ff] shadow-[0_0_8px_#00f3ff]'
                    : 'bg-[#121422]/40 border-slate-800 text-slate-700'
                }`}
              >
                <Heart size={13} className={i < stats.lives ? "fill-[#00f3ff] animate-pulse" : ""} />
              </div>
            ))}
          </div>
        </div>

        {/* EMP Smart Bomb Button */}
        <div className="pointer-events-auto">
          <button
            id="btn-emp-nuke"
            onClick={onUseBomb}
            disabled={stats.bombCount <= 0 || gameState !== 'PLAYING'}
            className={`px-3 py-2 rounded-lg border font-mono text-xs flex items-center gap-2 transition-all active:scale-95 ${
              stats.bombCount > 0
                ? 'bg-[#ff00ff1a] border-[#ff00ff] text-[#ff00ff] shadow-[0_0_12px_rgba(255,0,255,0.4)] hover:bg-[#ff00ff33] cursor-pointer'
                : 'bg-[#0a0c16]/50 border-slate-800 text-slate-600 cursor-not-allowed'
            }`}
          >
            <Bomb size={15} className={stats.bombCount > 0 ? "text-[#ff00ff]" : ""} />
            <div className="flex flex-col text-left">
              <span className="font-bold tracking-wider">EMP BLAST</span>
              <span className="text-[9px] text-[#ff00ff] font-mono opacity-80">
                {stats.bombCount} CHARGES (KEY: B)
              </span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
