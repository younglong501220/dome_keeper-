import React from 'react';
import { Volume2, VolumeX, Pause, HelpCircle, ArrowDown, Shield, Heart } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { GROUND_ROW, TILE_SIZE } from '../game/constants';

interface HUDProps {
  engine: GameEngine | null;
  onOpenUpgrade: () => void;
  onOpenHelp: () => void;
  onTogglePause: () => void;
  onToggleMute: () => void;
  isMuted: boolean;
}

export const HUD: React.FC<HUDProps> = ({
  engine,
  onOpenUpgrade,
  onOpenHelp,
  onTogglePause,
  onToggleMute,
  isMuted,
}) => {
  if (!engine) return null;

  const currentDepth = Math.max(
    0,
    Math.floor((engine.player.y - GROUND_ROW * TILE_SIZE) / TILE_SIZE)
  );

  const hpPercent = Math.max(0, Math.min(100, (engine.dome.hp / engine.dome.maxHp) * 100));
  const shieldPercent =
    engine.dome.maxShield > 0
      ? Math.max(0, Math.min(100, (engine.dome.shield / engine.dome.maxShield) * 100))
      : 0;

  const isAlert = engine.waveActive || (engine.waveTimer <= 7 && !engine.waveActive);

  return (
    <div className="absolute top-0 left-0 right-0 p-3 pointer-events-none flex flex-col gap-2 select-none z-10">
      {/* Top Header Strip */}
      <div className="flex items-center justify-between gap-4">
        {/* Left: Dome HP & Shield */}
        <div className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          {/* Health */}
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500/30" />
            <div className="w-24 sm:w-32 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
              <div
                className={`h-full transition-all duration-200 ${
                  hpPercent > 45 ? 'bg-emerald-500' : hpPercent > 20 ? 'bg-amber-500' : 'bg-rose-500'
                }`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-slate-300 tabular-nums">
              {Math.ceil(engine.dome.hp)}/{engine.dome.maxHp}
            </span>
          </div>

          {/* Shield if installed */}
          {engine.upgrades.shield > 0 && (
            <div className="flex items-center gap-1.5 border-l border-slate-700/80 pl-3">
              <Shield className="w-4 h-4 text-purple-400" />
              <div className="w-16 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                <div
                  className="h-full bg-purple-500 transition-all duration-200"
                  style={{ width: `${shieldPercent}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-purple-300 tabular-nums">
                {Math.ceil(engine.dome.shield)}
              </span>
            </div>
          )}
        </div>

        {/* Center: Threat Wave Timer / Alarm */}
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold text-sm tracking-wide shadow-lg pointer-events-auto transition-all ${
            engine.waveActive
              ? 'bg-rose-950/90 border-rose-500 text-rose-300 animate-pulse'
              : engine.waveTimer <= 7
              ? 'bg-amber-950/90 border-amber-500 text-amber-300 animate-bounce'
              : 'bg-slate-900/90 border-slate-700/60 text-slate-200'
          }`}
        >
          {engine.waveActive ? (
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span>敵襲警報：第 {engine.wave} 波入侵！</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-slate-400">距離襲擊：</span>
              <span className="font-mono text-base font-extrabold text-amber-400 tabular-nums">
                {Math.max(0, Math.ceil(engine.waveTimer))}s
              </span>
              <span className="text-xs text-slate-400">（波次 {engine.wave}）</span>
            </div>
          )}
        </div>

        {/* Right: Quick Settings Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md px-2 py-1.5 rounded-xl border border-slate-700/60 shadow-lg pointer-events-auto">
          <button
            onClick={onToggleMute}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            title={isMuted ? '開啟音效' : '靜音'}
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
          <button
            onClick={onTogglePause}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            title="暫停遊戲"
          >
            <Pause className="w-4 h-4" />
          </button>
          <button
            onClick={onOpenHelp}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-300 transition-colors"
            title="操作說明"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
          </button>
        </div>
      </div>

      {/* Secondary Sub-strip: Resources & Depth */}
      <div className="flex items-center justify-between gap-3 px-1">
        {/* Resources Badges */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Iron */}
          <div className="flex items-center gap-1.5 bg-stone-900/90 px-3 py-1.5 rounded-lg border border-amber-800/40 shadow">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#e0a96d] shadow-[0_0_8px_#e0a96d]" />
            <span className="text-xs font-semibold text-amber-200">鐵礦</span>
            <span className="text-xs font-mono font-bold text-amber-100 tabular-nums">
              {engine.resources.iron}
            </span>
          </div>

          {/* Water */}
          <div className="flex items-center gap-1.5 bg-sky-950/90 px-3 py-1.5 rounded-lg border border-sky-800/40 shadow">
            <span className="w-2.5 h-2.5 rounded-full bg-[#4ea8de] shadow-[0_0_8px_#4ea8de]" />
            <span className="text-xs font-semibold text-sky-200">水源</span>
            <span className="text-xs font-mono font-bold text-sky-100 tabular-nums">
              {engine.resources.water}
            </span>
          </div>

          {/* Cobalt */}
          <div className="flex items-center gap-1.5 bg-fuchsia-950/90 px-3 py-1.5 rounded-lg border border-fuchsia-800/40 shadow">
            <span className="w-2.5 h-2.5 rotate-45 bg-[#c743cb] shadow-[0_0_8px_#c743cb]" />
            <span className="text-xs font-semibold text-fuchsia-200">鈷礦</span>
            <span className="text-xs font-mono font-bold text-fuchsia-100 tabular-nums">
              {engine.resources.cobalt}
            </span>
          </div>

          {/* Carried items counter if carrying */}
          {engine.player.carriedItems.length > 0 && (
            <div className="flex items-center gap-1.5 bg-amber-900/70 px-2.5 py-1.5 rounded-lg border border-amber-600/40 text-xs text-amber-200 font-semibold animate-pulse">
              <span>拖曳負重: {engine.player.carriedItems.length} 件</span>
            </div>
          )}
        </div>

        {/* Depth Badge */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700/60 shadow text-xs font-medium text-slate-300 pointer-events-auto">
          <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
          <span>深度：</span>
          <span className="font-mono font-bold text-cyan-300 tabular-nums">{currentDepth}m</span>
        </div>
      </div>

      {/* In-Dome Context Prompt Banner */}
      {engine.player.inDome && (
        <div className="self-center mt-2 bg-slate-950/90 backdrop-blur-md px-4 py-2 rounded-full border border-amber-500/60 shadow-xl pointer-events-auto flex items-center gap-3 text-xs font-bold text-amber-300">
          <button
            onClick={() => engine.toggleLaserMode()}
            className={`px-3 py-1 rounded font-extrabold text-xs transition-colors flex items-center gap-1.5 cursor-pointer ${
              engine.player.controllingLaser
                ? 'bg-rose-600 hover:bg-rose-500 text-white animate-pulse shadow-md shadow-rose-600/30'
                : 'bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40'
            }`}
          >
            {engine.player.controllingLaser ? '退出雷射 (E)' : '操縱雷射砲 (E)'}
          </button>

          <button
            onClick={onOpenUpgrade}
            className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded font-extrabold text-xs transition-colors cursor-pointer shadow-md shadow-amber-500/20"
          >
            科技終端 (U)
          </button>
        </div>
      )}
    </div>
  );
};
