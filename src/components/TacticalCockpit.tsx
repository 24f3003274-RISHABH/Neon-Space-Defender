import React from 'react';
import { GameStats, GameState } from '../types';
import { 
  Shield, 
  Flame, 
  Zap, 
  Star, 
  Bomb, 
  Volume2, 
  VolumeX, 
  Music, 
  Tv, 
  Maximize2, 
  Minimize2, 
  Crosshair, 
  Radio,
  Activity,
  Cpu
} from 'lucide-react';

interface TacticalLeftPanelProps {
  stats: GameStats;
  gameState: GameState;
}

export const TacticalLeftPanel: React.FC<TacticalLeftPanelProps> = ({ stats, gameState }) => {
  const hullPercent = Math.max(0, Math.min(100, (stats.lives / stats.maxLives) * 100));

  return (
    <aside
      id="tactical-left-deck"
      aria-label="Tactical mission telemetry"
      className="hidden lg:flex w-72 xl:w-84 flex-col p-5 border-r border-[#00f3ff26] bg-[#050508]/80 backdrop-blur-xl shrink-0 justify-between select-none z-20"
    >
      {/* Top Deck Header */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-2 w-2 rounded-full bg-[#00f3ff] animate-ping" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#00f3ff] font-bold font-mono">
              TACTICAL BATTLE DECK
            </span>
          </div>
          <h1 className="text-2xl xl:text-3xl font-black italic tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-cyan-200 to-[#ff00ff] leading-none drop-shadow-[0_0_12px_rgba(0,243,255,0.7)]">
            NEON SPACE
          </h1>
          <div className="text-[11px] font-bold text-slate-400 tracking-widest font-arcade">
            DEFENDER MK-IV
          </div>
        </div>

        {/* Sector & Wave Metric Card */}
        <div className="p-3.5 rounded-xl bg-[#0a0c16]/90 border border-[#00f3ff33] shadow-[0_0_15px_rgba(0,243,255,0.08)]">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 flex items-center justify-between font-mono">
            <span>SECTOR COORDINATE</span>
            <span className="text-[#00f3ff] font-bold">WAVE {stats.wave}</span>
          </div>
          <div className="text-xl font-bold font-arcade text-white tracking-widest flex items-center gap-2">
            <Radio size={16} className="text-[#00f3ff] animate-pulse" />
            <span>SECTOR DELTA-{stats.wave}</span>
          </div>
        </div>

        {/* Mission Score Metric */}
        <div className="p-3.5 rounded-xl bg-[#0a0c16]/90 border border-[#ffffff14]">
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mb-1 font-mono">
            MISSION SCORE
          </div>
          <div className="text-3xl xl:text-4xl font-bold font-mono text-white tracking-wider tabular-nums drop-shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            {stats.score.toLocaleString()}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400 font-mono">RECORD HIGHSCORE</span>
            <span className="text-[#ff00ff] font-bold font-mono tracking-wider">
              {stats.highScore.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Tactical Performance Metrics */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-[#0a0c16]/70 border border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
              HOSTILES DOWN
            </span>
            <span className="text-base font-bold font-arcade text-[#00f3ff]">
              {stats.enemiesDestroyed}
            </span>
          </div>
          <div className="p-2.5 rounded-lg bg-[#0a0c16]/70 border border-slate-800">
            <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-mono">
              FIRING ACCURACY
            </span>
            <span className="text-base font-bold font-arcade text-amber-300">
              {stats.accuracy}%
            </span>
          </div>
        </div>
      </div>

      {/* Hull Integrity & Status Deck */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
        <div>
          <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-slate-400 mb-2 font-mono">
            <span>HULL INTEGRITY</span>
            <span className={hullPercent > 35 ? "text-[#00f3ff] font-bold" : "text-red-400 font-bold animate-pulse"}>
              {stats.lives} / {stats.maxLives} UNITS
            </span>
          </div>

          {/* Glowing Life Cells */}
          <div className="flex items-center gap-2 mb-2">
            {Array.from({ length: stats.maxLives }).map((_, i) => {
              const isActive = i < stats.lives;
              return (
                <div
                  key={i}
                  className={`h-5 flex-1 rounded-sm border transition-all duration-300 ${
                    isActive
                      ? 'bg-[#00f3ff] border-[#00f3ff] shadow-[0_0_12px_#00f3ff]'
                      : 'bg-[#121422] border-slate-800 opacity-40'
                  }`}
                />
              );
            })}
          </div>

          {/* Hull Percentage Bar */}
          <div className="h-1.5 w-full bg-[#121422] rounded-full overflow-hidden border border-slate-800">
            <div
              className="h-full bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] transition-all duration-300"
              style={{ width: `${hullPercent}%` }}
            />
          </div>
        </div>

        {/* EMP Ordnance Capacity */}
        <div className="p-3 rounded-lg bg-[#150a24]/60 border border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bomb size={16} className="text-purple-400" />
            <div className="flex flex-col">
              <span className="text-[10px] font-bold tracking-wider text-purple-300 font-arcade">
                EMP WARHEADS
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                TRIGGER: [B] KEY
              </span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {Array.from({ length: stats.maxBombs }).map((_, i) => (
              <span
                key={i}
                className={`w-2.5 h-2.5 rounded-full ${
                  i < stats.bombCount ? 'bg-purple-400 shadow-[0_0_6px_#a855f7]' : 'bg-slate-800'
                }`}
              />
            ))}
          </div>
        </div>

        {/* System State Indicator */}
        <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-[#060810] border border-slate-800 text-[10px] font-mono">
          <span className="text-slate-500 uppercase">SYS STATUS</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <Activity size={12} className="animate-pulse" />
            {gameState === 'PLAYING' ? 'COMBAT ACTIVE' : gameState === 'PAUSED' ? 'SUSPENDED' : 'STANDBY'}
          </span>
        </div>
      </div>
    </aside>
  );
};

interface TacticalRightPanelProps {
  stats: GameStats;
  sfxOn: boolean;
  musicOn: boolean;
  onToggleSfx: () => void;
  onToggleMusic: () => void;
  volume: number;
  onChangeVolume: (v: number) => void;
  crtEnabled: boolean;
  onToggleCrt: () => void;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const TacticalRightPanel: React.FC<TacticalRightPanelProps> = ({
  stats,
  sfxOn,
  musicOn,
  onToggleSfx,
  onToggleMusic,
  volume,
  onChangeVolume,
  crtEnabled,
  onToggleCrt,
  isFullscreen,
  onToggleFullscreen,
}) => {
  return (
    <aside
      id="tactical-right-deck"
      aria-label="Tactical systems and audio-visual configuration"
      className="hidden lg:flex w-72 xl:w-84 flex-col p-5 border-l border-[#ff00ff26] bg-[#050508]/80 backdrop-blur-xl shrink-0 justify-between select-none z-20"
    >
      {/* Power-Up Buffs Deck */}
      <div className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Cpu size={14} className="text-[#ff00ff]" />
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#ff00ff] font-bold font-mono">
              TACTICAL POWER ENHANCERS
            </span>
          </div>
          <h2 className="text-lg font-bold font-arcade text-white tracking-wider">
            SYSTEM BUFFS
          </h2>
        </div>

        {/* Buff Cards */}
        <div className="flex flex-col gap-2">
          {stats.activeBuffs.length === 0 ? (
            <div className="p-4 rounded-xl bg-[#0a0c16]/50 border border-slate-800/80 text-center flex flex-col items-center justify-center gap-1.5">
              <Crosshair size={20} className="text-slate-600 animate-spin" />
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-mono">
                NO ACTIVE ENHANCEMENTS
              </span>
              <span className="text-[9px] text-slate-600">
                Collect glowing power-ups during combat
              </span>
            </div>
          ) : (
            stats.activeBuffs.map((buff) => {
              const percent = (buff.timeLeft / buff.maxDuration) * 100;
              return (
                <div
                  key={buff.type}
                  className="p-2.5 rounded-xl bg-[#0a0c16]/90 border backdrop-blur-md flex flex-col gap-1.5 transition-all"
                  style={{ borderColor: `${buff.color}66`, boxShadow: `0 0 15px ${buff.color}22` }}
                >
                  <div className="flex items-center justify-between text-xs font-bold font-arcade tracking-wider">
                    <span className="flex items-center gap-1.5" style={{ color: buff.color }}>
                      {buff.type === 'SHIELD' && <Shield size={13} />}
                      {buff.type === 'TRIPLE_SHOT' && <Flame size={13} />}
                      {buff.type === 'RAPID_FIRE' && <Zap size={13} />}
                      {buff.type === 'SCORE_BOOST' && <Star size={13} />}
                      {buff.label}
                    </span>
                    <span className="text-white text-[11px] font-mono">
                      {buff.timeLeft.toFixed(1)}s
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full rounded-full transition-all duration-75"
                      style={{ width: `${percent}%`, backgroundColor: buff.color }}
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Tactical Transmission Field Intel */}
        <div className="p-3.5 rounded-xl bg-[#00f3ff0d] border border-[#00f3ff33] text-xs flex flex-col gap-1.5 shadow-[0_0_15px_rgba(0,243,255,0.06)]">
          <div className="flex items-center justify-between text-[9px] uppercase tracking-widest text-[#00f3ff] font-bold font-mono">
            <span>TRANSMISSION: HQ-09</span>
            <span className="text-emerald-400">ONLINE</span>
          </div>
          <p className="text-[11px] text-slate-300 leading-relaxed font-mono">
            {stats.wave >= 5
              ? '⚠️ Warning: Heavy enemy interceptors and high-density asteroid clusters detected. Prepare EMP charges!'
              : '🔹 Advisory: Target asteroid cores to trigger fragmentation bonuses. Maintain evasive vector.'}
          </p>
        </div>
      </div>

      {/* AV & System Controls Deck */}
      <div className="flex flex-col gap-3 pt-4 border-t border-slate-800/80">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 font-mono">
          AV HARDWARE & DISPLAY
        </div>

        {/* Toggle Grid */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleSfx}
            className={`py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
              sfxOn
                ? 'bg-[#00f3ff1a] border-[#00f3ff] text-[#00f3ff] shadow-[0_0_8px_rgba(0,243,255,0.2)]'
                : 'bg-[#0a0c16] border-slate-800 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              {sfxOn ? <Volume2 size={13} /> : <VolumeX size={13} />} SFX
            </span>
            <span className="text-[9px] font-bold">{sfxOn ? 'ON' : 'OFF'}</span>
          </button>

          <button
            onClick={onToggleMusic}
            className={`py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-between transition-all ${
              musicOn
                ? 'bg-[#ff00ff1a] border-[#ff00ff] text-[#ff00ff] shadow-[0_0_8px_rgba(255,0,255,0.2)]'
                : 'bg-[#0a0c16] border-slate-800 text-slate-500'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Music size={13} /> BGM
            </span>
            <span className="text-[9px] font-bold">{musicOn ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Master Volume Slider */}
        <div className="p-2.5 rounded-lg bg-[#0a0c16] border border-slate-800 flex flex-col gap-1">
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>SYNTH MASTER VOL</span>
            <span className="text-[#00f3ff] font-bold">{Math.round(volume * 100)}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={volume}
            onChange={(e) => onChangeVolume(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#00f3ff]"
          />
        </div>

        {/* CRT & Fullscreen Bar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onToggleCrt}
            className={`py-2 px-3 rounded-lg border text-xs font-mono flex items-center justify-center gap-1.5 transition-all ${
              crtEnabled
                ? 'bg-[#00f3ff1a] border-[#00f3ff] text-[#00f3ff]'
                : 'bg-[#0a0c16] border-slate-800 text-slate-500'
            }`}
          >
            <Tv size={13} /> CRT SHADER
          </button>

          <button
            onClick={onToggleFullscreen}
            className="py-2 px-3 rounded-lg bg-[#0a0c16] hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono flex items-center justify-center gap-1.5 transition-all"
          >
            {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />} FULLSCREEN
          </button>
        </div>
      </div>
    </aside>
  );
};
