import React, { useRef } from 'react';
import { GameEngine } from '../game/gameEngine';
import { Crosshair, Cpu, Wrench } from 'lucide-react';

interface TouchControlsProps {
  engine: GameEngine;
  onOpenUpgrade: () => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({ engine, onOpenUpgrade }) => {
  const joystickRef = useRef<HTMLDivElement>(null);

  const handleTouchStartOrMove = (e: React.TouchEvent) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = touch.clientX - centerX;
    const dy = touch.clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = rect.width / 2;

    if (dist > 0) {
      const clampedDist = Math.min(dist, maxRadius);
      engine.virtualInput.x = (dx / dist) * (clampedDist / maxRadius);
      engine.virtualInput.y = (dy / dist) * (clampedDist / maxRadius);
    }
  };

  const handleTouchEnd = () => {
    engine.virtualInput.x = 0;
    engine.virtualInput.y = 0;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex justify-between items-end p-5 select-none sm:hidden">
      {/* Left: Virtual Joystick Pad */}
      <div
        ref={joystickRef}
        onTouchStart={handleTouchStartOrMove}
        onTouchMove={handleTouchStartOrMove}
        onTouchEnd={handleTouchEnd}
        className="w-28 h-28 rounded-full bg-slate-900/70 border-2 border-slate-700/80 pointer-events-auto flex items-center justify-center relative touch-none backdrop-blur-sm shadow-xl"
      >
        <div
          className="w-12 h-12 rounded-full bg-amber-500/80 border border-amber-300 shadow-lg pointer-events-none transition-transform"
          style={{
            transform: `translate(${engine.virtualInput.x * 24}px, ${engine.virtualInput.y * 24}px)`,
          }}
        />
      </div>

      {/* Right: Quick Action Buttons */}
      <div className="flex flex-col gap-3 pointer-events-auto items-end">
        {/* Toggle Laser [E] */}
        {engine.player.inDome && (
          <button
            onClick={() => engine.toggleLaserMode()}
            className="flex items-center gap-2 px-4 py-3 bg-rose-600/90 active:bg-rose-500 text-white rounded-xl shadow-lg border border-rose-400 font-bold text-xs"
          >
            <Crosshair className="w-4 h-4" />
            <span>{engine.player.controllingLaser ? '退出雷射' : '操縱雷射'}</span>
          </button>
        )}

        {/* Upgrade Terminal [U] */}
        {engine.player.inDome && (
          <button
            onClick={onOpenUpgrade}
            className="flex items-center gap-2 px-4 py-3 bg-amber-600/90 active:bg-amber-500 text-white rounded-xl shadow-lg border border-amber-400 font-bold text-xs"
          >
            <Cpu className="w-4 h-4" />
            <span>科技終端</span>
          </button>
        )}

        {/* Quick Dome Repair */}
        {engine.player.inDome && engine.resources.cobalt >= 1 && engine.dome.hp < engine.dome.maxHp && (
          <button
            onClick={() => engine.repairDome()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-blue-600/90 active:bg-blue-500 text-white rounded-xl shadow-lg border border-blue-400 font-bold text-xs"
          >
            <Wrench className="w-4 h-4" />
            <span>修復外殼</span>
          </button>
        )}
      </div>
    </div>
  );
};
