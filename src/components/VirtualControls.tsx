import React from 'react';
import { ChevronLeft, ChevronRight, Zap, Bomb } from 'lucide-react';

interface VirtualControlsProps {
  onMoveLeftStart: () => void;
  onMoveLeftEnd: () => void;
  onMoveRightStart: () => void;
  onMoveRightEnd: () => void;
  onFireStart: () => void;
  onFireEnd: () => void;
  onBomb: () => void;
  bombCount: number;
}

export const VirtualControls: React.FC<VirtualControlsProps> = ({
  onMoveLeftStart,
  onMoveLeftEnd,
  onMoveRightStart,
  onMoveRightEnd,
  onFireStart,
  onFireEnd,
  onBomb,
  bombCount,
}) => {
  return (
    <div id="virtual-controls-container" className="sm:hidden w-full flex items-center justify-between px-4 py-2.5 bg-[#050508]/95 border-t border-[#00f3ff33] pointer-events-auto z-20">
      {/* Left/Right D-Pad */}
      <div className="flex items-center gap-2">
        <button
          id="btn-touch-left"
          onTouchStart={onMoveLeftStart}
          onTouchEnd={onMoveLeftEnd}
          onMouseDown={onMoveLeftStart}
          onMouseUp={onMoveLeftEnd}
          className="w-13 h-13 rounded-xl bg-[#0a0c16] border border-[#00f3ff66] text-[#00f3ff] active:bg-[#00f3ff33] flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.2)] active:scale-90 select-none"
        >
          <ChevronLeft size={26} />
        </button>

        <button
          id="btn-touch-right"
          onTouchStart={onMoveRightStart}
          onTouchEnd={onMoveRightEnd}
          onMouseDown={onMoveRightStart}
          onMouseUp={onMoveRightEnd}
          className="w-13 h-13 rounded-xl bg-[#0a0c16] border border-[#00f3ff66] text-[#00f3ff] active:bg-[#00f3ff33] flex items-center justify-center shadow-[0_0_10px_rgba(0,243,255,0.2)] active:scale-90 select-none"
        >
          <ChevronRight size={26} />
        </button>
      </div>

      {/* Action Buttons: Bomb & Fire */}
      <div className="flex items-center gap-2.5">
        <button
          id="btn-touch-bomb"
          onClick={onBomb}
          disabled={bombCount <= 0}
          className={`w-12 h-12 rounded-xl border flex flex-col items-center justify-center text-xs font-mono select-none ${
            bombCount > 0
              ? 'bg-[#ff00ff1a] border-[#ff00ff] text-[#ff00ff] shadow-[0_0_10px_rgba(255,0,255,0.4)] active:scale-90'
              : 'bg-[#0a0c16]/50 border-slate-800 text-slate-600'
          }`}
        >
          <Bomb size={16} />
          <span className="text-[9px] font-bold">{bombCount}</span>
        </button>

        <button
          id="btn-touch-fire"
          onTouchStart={onFireStart}
          onTouchEnd={onFireEnd}
          onMouseDown={onFireStart}
          onMouseUp={onFireEnd}
          className="w-15 h-15 rounded-2xl bg-gradient-to-r from-[#00f3ff] to-[#ff00ff] text-slate-950 flex items-center justify-center font-mono font-bold shadow-[0_0_18px_rgba(0,243,255,0.6)] active:scale-90 select-none"
        >
          <Zap size={26} className="fill-slate-950" />
        </button>
      </div>
    </div>
  );
};
