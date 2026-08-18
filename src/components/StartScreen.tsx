import React from 'react';
import { Play, Shield, Flame, Zap, Award, Compass, Radio } from 'lucide-react';
import { DifficultyMode, ShipSkin } from '../types';

interface StartScreenProps {
  onStart: (difficulty: DifficultyMode, skin: ShipSkin) => void;
  highScore: number;
}

export const StartScreen: React.FC<StartScreenProps> = ({ onStart, highScore }) => {
  const [selectedDifficulty, setSelectedDifficulty] = React.useState<DifficultyMode>('NORMAL');
  const [selectedSkin, setSelectedSkin] = React.useState<ShipSkin>('CYAN_VIPER');

  const difficulties: { id: DifficultyMode; label: string; desc: string; color: string }[] = [
    { id: 'EASY', label: 'CADET', desc: '4 Lives, slower enemy fleets', color: 'border-emerald-500 text-emerald-400' },
    { id: 'NORMAL', label: 'PILOT', desc: '3 Lives, standard arcade speed', color: 'border-[#00f3ff] text-[#00f3ff]' },
    { id: 'HARD', label: 'ACE', desc: '2 Lives, aggressive swarms', color: 'border-[#ff00ff] text-[#ff00ff]' },
    { id: 'NIGHTMARE', label: 'CYBER', desc: '1 Life, hyper bullet storm', color: 'border-red-500 text-red-500' },
  ];

  const skins: { id: ShipSkin; name: string; primary: string; secondary: string }[] = [
    { id: 'CYAN_VIPER', name: 'Cyan Viper', primary: '#00f3ff', secondary: '#0066ff' },
    { id: 'NEON_PHOENIX', name: 'Neon Phoenix', primary: '#ff00ff', secondary: '#ff7700' },
    { id: 'EMERALD_SPECTRE', name: 'Emerald Spectre', primary: '#00ffaa', secondary: '#008855' },
    { id: 'SOLAR_FLARE', name: 'Solar Flare', primary: '#ffb800', secondary: '#ff4400' },
  ];

  return (
    <div id="start-screen-modal" className="absolute inset-0 z-20 flex flex-col items-center justify-between p-4 sm:p-6 bg-[#050508]/90 backdrop-blur-xl overflow-y-auto">
      {/* Title Header */}
      <div className="flex flex-col items-center text-center mt-1">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-[#00f3ff] animate-ping" />
          <span className="text-[10px] font-mono tracking-[0.25em] text-[#00f3ff] uppercase font-bold">
            NEURAL FLIGHT SIMULATOR // VER 2.0
          </span>
          <span className="h-1.5 w-1.5 rounded-full bg-[#00f3ff] animate-ping" />
        </div>
        
        <h1 className="text-3xl sm:text-5xl font-black italic text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] via-white to-[#ff00ff] tracking-wider drop-shadow-[0_0_25px_rgba(0,243,255,0.7)] font-arcade">
          NEON SPACE DEFENDER
        </h1>

        {highScore > 0 && (
          <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-[#1a1a2e]/80 border border-[#ff00ff44] rounded-full text-xs text-[#ff00ff] font-mono">
            <Award size={14} className="text-[#ff00ff]" />
            <span className="tracking-wider">RECORD BEST: {highScore.toLocaleString()}</span>
          </div>
        )}
      </div>

      {/* Configuration Center: Ship & Difficulty */}
      <div className="w-full max-w-md flex flex-col gap-3.5 my-auto">
        {/* Ship Hull Selection */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-300 uppercase tracking-wider flex items-center gap-1.5 font-bold">
              <Compass size={14} className="text-[#00f3ff]" /> Select Starfighter Chassis
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {skins.map((s) => (
              <button
                key={s.id}
                id={`skin-btn-${s.id}`}
                onClick={() => setSelectedSkin(s.id)}
                className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                  selectedSkin === s.id
                    ? 'bg-[#0a0c16] border-[#00f3ff] shadow-[0_0_15px_rgba(0,243,255,0.35)]'
                    : 'bg-[#050508]/70 border-slate-800/80 hover:border-slate-700 opacity-60 hover:opacity-100'
                }`}
              >
                {/* Ship Vector Mock Mini Icon */}
                <div
                  className="w-5 h-6 relative my-1"
                  style={{
                    filter: `drop-shadow(0 0 6px ${s.primary})`,
                  }}
                >
                  <div
                    className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-b-[24px]"
                    style={{ borderBottomColor: s.primary }}
                  />
                </div>
                <span className="text-[10px] font-mono font-bold tracking-tight text-slate-200">
                  {s.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty Selection */}
        <div className="flex flex-col gap-1.5">
          <span className="text-xs font-mono text-slate-300 uppercase tracking-wider font-bold">
            Tactical Threat Level
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {difficulties.map((diff) => (
              <button
                key={diff.id}
                id={`diff-btn-${diff.id}`}
                onClick={() => setSelectedDifficulty(diff.id)}
                className={`p-2 rounded-lg border text-left flex flex-col gap-0.5 transition-all cursor-pointer ${
                  selectedDifficulty === diff.id
                    ? `bg-[#0a0c16] ${diff.color} shadow-[0_0_12px_rgba(0,243,255,0.25)]`
                    : 'bg-[#050508]/70 border-slate-800/80 text-slate-400 hover:border-slate-700'
                }`}
              >
                <span className="font-mono font-bold text-xs tracking-wider">
                  {diff.label}
                </span>
                <span className="text-[9px] text-slate-400 leading-tight font-mono">
                  {diff.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Power-up Guide Badges */}
        <div className="p-2.5 bg-[#0a0c16]/80 border border-slate-800 rounded-lg flex items-center justify-around text-slate-300 text-xs font-mono">
          <div className="flex items-center gap-1">
            <span className="text-[#00f3ff]">🛡️</span>
            <span className="text-[10px]">Shield</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#ffb800]">🔱</span>
            <span className="text-[10px]">Triple Shot</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#00ffaa]">⚡</span>
            <span className="text-[10px]">Rapid Fire</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-[#ff00ff]">💥</span>
            <span className="text-[10px]">EMP Nuke</span>
          </div>
        </div>

        {/* Controls Tutorial Box */}
        <div className="p-2 bg-[#050508]/90 border border-[#00f3ff22] rounded-lg flex items-center justify-between text-[10px] text-slate-400 font-mono">
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#0a0c16] border border-slate-700 rounded text-[#00f3ff]">A / D</kbd>
            <span className="text-slate-600">or</span>
            <kbd className="px-1.5 py-0.5 bg-[#0a0c16] border border-slate-700 rounded text-[#00f3ff]">← / →</kbd>
            <span>Move</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#0a0c16] border border-slate-700 rounded text-[#00f3ff]">SPACE</kbd>
            <span>Fire</span>
          </div>
          <div className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-[#0a0c16] border border-slate-700 rounded text-[#ff00ff]">B</kbd>
            <span>EMP</span>
          </div>
        </div>
      </div>

      {/* Launch Button */}
      <div className="w-full max-w-md mt-2">
        <button
          id="btn-launch-mission"
          onClick={() => onStart(selectedDifficulty, selectedSkin)}
          className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-[#00f3ff] via-cyan-400 to-[#ff00ff] hover:opacity-95 text-slate-950 font-mono font-black text-sm sm:text-base tracking-widest shadow-[0_0_25px_rgba(0,243,255,0.6)] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
        >
          <Play size={18} className="fill-slate-950" />
          <span>INITIALIZE COMBAT MISSION</span>
        </button>
      </div>
    </div>
  );
};
