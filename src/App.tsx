/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from './game/GameEngine';
import { sound } from './audio/soundEngine';
import { GameHUD } from './components/GameHUD';
import { StartScreen } from './components/StartScreen';
import { GameOverModal } from './components/GameOverModal';
import { VirtualControls } from './components/VirtualControls';
import { TacticalLeftPanel, TacticalRightPanel } from './components/TacticalCockpit';
import { DifficultyMode, GameState, GameStats, ShipSkin } from './types';
import { Maximize2, Minimize2, Tv, Sparkles, HelpCircle, X, Volume2, VolumeX, Music } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const [gameState, setGameState] = useState<GameState>('START');
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [sfxOn, setSfxOn] = useState<boolean>(true);
  const [musicOn, setMusicOn] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.8);

  const [stats, setStats] = useState<GameStats>({
    score: 0,
    highScore: 0,
    lives: 3,
    maxLives: 5,
    level: 1,
    wave: 1,
    enemiesDestroyed: 0,
    accuracy: 100,
    shotsFired: 0,
    shotsHit: 0,
    bossDefeated: 0,
    activeBuffs: [],
    bombCount: 2,
    maxBombs: 3,
  });

  // Initialize Game Engine on Canvas Mount
  useEffect(() => {
    if (!canvasRef.current) return;

    const engine = new GameEngine(
      canvasRef.current,
      (newStats) => setStats({ ...newStats }),
      (newState) => setGameState(newState)
    );

    engineRef.current = engine;
    engine.startLoop();

    // Mouse / Pointer Move listener on canvas
    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!canvasRef.current || engine.state !== 'PLAYING') return;
      const rect = canvasRef.current.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const scaleX = canvasRef.current.width / rect.width;
      const canvasX = (clientX - rect.left) * scaleX;
      engine.touchX = Math.max(25, Math.min(canvasRef.current.width - 25, canvasX));
    };

    const handlePointerUp = () => {
      if (engine) engine.touchX = null;
    };

    const canvasEl = canvasRef.current;
    canvasEl.addEventListener('mousemove', handlePointerMove);
    canvasEl.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseup', handlePointerUp);
    window.addEventListener('touchend', handlePointerUp);

    return () => {
      engine.stopLoop();
      canvasEl.removeEventListener('mousemove', handlePointerMove);
      canvasEl.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      window.removeEventListener('touchend', handlePointerUp);
    };
  }, []);

  const handleStartGame = (difficulty: DifficultyMode, skin: ShipSkin) => {
    if (!engineRef.current) return;
    engineRef.current.setShipSkin(skin);
    engineRef.current.setDifficulty(difficulty);
    engineRef.current.startNewGame(difficulty);
  };

  const handleRestartGame = () => {
    if (!engineRef.current) return;
    engineRef.current.startNewGame();
  };

  const handleHome = () => {
    if (!engineRef.current) return;
    engineRef.current.setState('START');
    sound.stopMusic();
  };

  const handlePauseToggle = () => {
    if (!engineRef.current) return;
    engineRef.current.togglePause();
  };

  const handleUseBomb = () => {
    if (!engineRef.current) return;
    engineRef.current.useBomb();
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const handleToggleSfx = () => {
    const res = sound.toggleSfx();
    setSfxOn(res);
  };

  const handleToggleMusic = () => {
    const res = sound.toggleMusic();
    setMusicOn(res);
  };

  return (
    <main
      ref={containerRef}
      id="neon-defender-app"
      className="relative w-screen h-screen bg-[#050505] bg-immersive-radial text-[#e0e0e0] flex items-stretch justify-between select-none overflow-hidden font-mono"
    >
      {/* Left Tactical Command Deck (Desktop Cockpit) */}
      <TacticalLeftPanel stats={stats} gameState={gameState} />

      {/* Center Game Arena Column */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-0 sm:p-3 md:p-5 overflow-hidden">
        {/* Game Screen Frame Container */}
        <div className="relative w-full max-w-[600px] h-full max-h-[820px] flex flex-col items-center justify-center shadow-[0_0_50px_rgba(0,243,255,0.12)] bg-[#000000] border-0 sm:border-2 sm:border-[#00f3ff44] sm:rounded-2xl overflow-hidden">
          
          {/* Canvas Element */}
          <canvas
            ref={canvasRef}
            id="game-canvas"
            width={600}
            height={800}
            className="w-full h-full object-contain cursor-crosshair"
          />

          {/* Retro CRT Scanlines & Screen Vignette Overlay */}
          {crtEnabled && (
            <>
              <div className="absolute inset-0 scanlines pointer-events-none z-10 opacity-70" />
              <div className="absolute inset-0 crt-vignette pointer-events-none z-10" />
            </>
          )}

          {/* Active In-Game HUD */}
          {(gameState === 'PLAYING' || gameState === 'PAUSED') && (
            <GameHUD
              stats={stats}
              gameState={gameState}
              onPauseToggle={handlePauseToggle}
              onUseBomb={handleUseBomb}
              sfxOn={sfxOn}
              musicOn={musicOn}
              onToggleSfx={handleToggleSfx}
              onToggleMusic={handleToggleMusic}
              volume={volume}
              onChangeVolume={(v) => {
                setVolume(v);
                sound.setMasterVolume(v);
              }}
            />
          )}

          {/* Start / Hangar Screen */}
          {gameState === 'START' && (
            <StartScreen onStart={handleStartGame} highScore={stats.highScore} />
          )}

          {/* Paused Screen Overlay */}
          {gameState === 'PAUSED' && (
            <div id="paused-overlay" className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-[#050508]/85 backdrop-blur-md">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-[#00f3ff] animate-ping" />
                <span className="text-[10px] font-mono tracking-widest text-[#00f3ff] uppercase font-bold">SYSTEM SUSPENDED</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black italic font-arcade text-transparent bg-clip-text bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] tracking-widest drop-shadow-[0_0_15px_rgba(0,243,255,0.8)] mb-6">
                TACTICAL PAUSE
              </h2>
              <div className="flex flex-col gap-3 w-64">
                <button
                  id="btn-resume-game"
                  onClick={handlePauseToggle}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-[#00f3ff] to-[#0088ff] hover:opacity-95 text-slate-950 font-mono font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(0,243,255,0.5)] cursor-pointer"
                >
                  RESUME MISSION
                </button>
                <button
                  id="btn-quit-hangar"
                  onClick={handleHome}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#0a0c16] hover:bg-slate-900 border border-slate-700 text-slate-300 font-mono text-xs tracking-wider transition-all cursor-pointer"
                >
                  ABORT TO HANGAR
                </button>
              </div>
            </div>
          )}

          {/* Game Over Screen Modal */}
          {gameState === 'GAMEOVER' && (
            <GameOverModal stats={stats} onRestart={handleRestartGame} onHome={handleHome} />
          )}

          {/* Mobile Virtual Controls */}
          {gameState === 'PLAYING' && (
            <VirtualControls
              onMoveLeftStart={() => {
                if (engineRef.current) engineRef.current.keys['ArrowLeft'] = true;
              }}
              onMoveLeftEnd={() => {
                if (engineRef.current) engineRef.current.keys['ArrowLeft'] = false;
              }}
              onMoveRightStart={() => {
                if (engineRef.current) engineRef.current.keys['ArrowRight'] = true;
              }}
              onMoveRightEnd={() => {
                if (engineRef.current) engineRef.current.keys['ArrowRight'] = false;
              }}
              onFireStart={() => {
                if (engineRef.current) engineRef.current.isTouchFiring = true;
              }}
              onFireEnd={() => {
                if (engineRef.current) engineRef.current.isTouchFiring = false;
              }}
              onBomb={handleUseBomb}
              bombCount={stats.bombCount}
            />
          )}
        </div>
      </div>

      {/* Right Tactical Systems Deck (Desktop Cockpit) */}
      <TacticalRightPanel
        stats={stats}
        sfxOn={sfxOn}
        musicOn={musicOn}
        onToggleSfx={handleToggleSfx}
        onToggleMusic={handleToggleMusic}
        volume={volume}
        onChangeVolume={(v) => {
          setVolume(v);
          sound.setMasterVolume(v);
        }}
        crtEnabled={crtEnabled}
        onToggleCrt={() => setCrtEnabled(!crtEnabled)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
      />

      {/* Floating Auxiliary Toolbar for Tablets & Small Desktops */}
      <aside aria-label="Game auxiliary toolbar" className="flex lg:hidden items-center gap-2 absolute bottom-3 right-4 z-40 bg-[#050508]/85 border border-[#00f3ff33] px-3 py-1.5 rounded-full backdrop-blur-md text-xs text-slate-400 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
        <button
          id="btn-toggle-crt"
          onClick={() => setCrtEnabled(!crtEnabled)}
          title="Toggle CRT Scanline Shader"
          className={`p-1.5 rounded hover:text-white transition-all ${crtEnabled ? 'text-[#00f3ff]' : 'text-slate-500'}`}
        >
          <Tv size={15} />
        </button>

        <button
          id="btn-help-modal"
          onClick={() => setShowHelp(true)}
          title="Game Manual / Shortcuts"
          className="p-1.5 rounded hover:text-[#00f3ff] transition-all"
        >
          <HelpCircle size={15} />
        </button>

        <button
          id="btn-toggle-fullscreen"
          onClick={toggleFullscreen}
          title="Fullscreen Mode"
          className="p-1.5 rounded hover:text-white transition-all"
        >
          {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
        </button>
      </aside>

      {/* Controls / Info Modal */}
      {showHelp && (
        <div id="help-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050508]/90 backdrop-blur-md animate-in fade-in">
          <div className="w-full max-w-md bg-[#0a0c16] border border-[#00f3ff44] rounded-2xl p-6 shadow-[0_0_40px_rgba(0,243,255,0.2)] relative">
            <button
              id="btn-close-help"
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-mono font-bold text-[#00f3ff] mb-4 flex items-center gap-2">
              <Sparkles size={18} /> TACTICAL FLIGHT MANUAL
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300 font-mono">
              <div className="flex items-center justify-between p-2.5 bg-[#050508] border border-slate-800 rounded-lg">
                <span className="font-semibold text-slate-300">Horizontal Thrusters</span>
                <span className="text-[#00f3ff] font-bold">A / D or ← / → or Mouse</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#050508] border border-slate-800 rounded-lg">
                <span className="font-semibold text-slate-300">Continuous Lasers</span>
                <span className="text-[#00f3ff] font-bold">SPACE or Left Click</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#050508] border border-slate-800 rounded-lg">
                <span className="font-semibold text-slate-300">Tactical EMP Blast</span>
                <span className="text-[#ff00ff] font-bold">B Key</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#050508] border border-slate-800 rounded-lg">
                <span className="font-semibold text-slate-300">Pause Mission</span>
                <span className="text-slate-400 font-bold">P or ESC</span>
              </div>
            </div>

            <div className="mt-5 p-3.5 bg-[#00f3ff0d] border border-[#00f3ff33] rounded-xl text-[11px] text-[#00f3ff] font-mono leading-relaxed">
              💡 <strong>Pilot Directive:</strong> Asteroids fracture into score-rich fragments. Chain enemy kills to deploy rare shields, plasma beams, and EMP warheads!
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
