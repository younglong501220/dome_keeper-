import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Skull, RotateCcw, Clock, Pickaxe, Shield, Target } from 'lucide-react';
import { GameStats } from '../game/types';

interface GameOverModalProps {
  isVictory: boolean;
  stats: GameStats;
  wave: number;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isVictory,
  stats,
  wave,
  onRestart,
}) => {
  useEffect(() => {
    if (isVictory) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
      const timer = setTimeout(() => {
        confetti({
          particleCount: 120,
          spread: 100,
          origin: { y: 0.5 },
        });
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [isVictory]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = Math.floor(secs % 60);
    return `${mins} 分 ${rem < 10 ? '0' : ''}${rem} 秒`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 flex flex-col items-center text-center">
        {/* Icon banner */}
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 shadow-xl ${
            isVictory
              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              : 'bg-rose-500/20 text-rose-500 border border-rose-500/30'
          }`}
        >
          {isVictory ? <Trophy className="w-8 h-8" /> : <Skull className="w-8 h-8" />}
        </div>

        {/* Title */}
        <h2 className="text-2xl font-black text-slate-100">
          {isVictory ? '★ 守護任務大獲全勝！ ★' : '穹頂外殼徹底崩塌'}
        </h2>
        <p className="text-sm text-slate-400 mt-1 max-w-sm">
          {isVictory
            ? '你成功從地底深淵挖出了古代遺跡核心，並守住了最終暴風雨般的異形反撲！'
            : `在外星群落的狂暴衝擊下，穹頂於第 ${wave} 波被攻破。這顆星球依然深不可測。`}
        </p>

        {/* Stat Grid */}
        <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-3 my-6">
          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <Shield className="w-4 h-4 text-emerald-400 mb-1" />
            <span className="text-[11px] text-slate-400">堅守波次</span>
            <span className="text-base font-mono font-bold text-slate-100 tabular-nums">
              {stats.wavesSurvived} 波
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <Pickaxe className="w-4 h-4 text-amber-400 mb-1" />
            <span className="text-[11px] text-slate-400">採掘岩層</span>
            <span className="text-base font-mono font-bold text-slate-100 tabular-nums">
              {stats.tilesMined} 塊
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <Target className="w-4 h-4 text-rose-400 mb-1" />
            <span className="text-[11px] text-slate-400">擊滅外星生物</span>
            <span className="text-base font-mono font-bold text-slate-100 tabular-nums">
              {stats.enemiesDefeated} 隻
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-sm mb-1">⚙ 💧 💠</span>
            <span className="text-[11px] text-slate-400">回收資源總量</span>
            <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
              {stats.ironCollected} 鐵 · {stats.waterCollected} 水 · {stats.cobaltCollected} 鈷
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <span className="text-sm text-cyan-400 font-bold mb-1">▼</span>
            <span className="text-[11px] text-slate-400">最深探勘</span>
            <span className="text-base font-mono font-bold text-cyan-300 tabular-nums">
              {stats.maxDepthReached}m
            </span>
          </div>

          <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 flex flex-col items-center">
            <Clock className="w-4 h-4 text-purple-400 mb-1" />
            <span className="text-[11px] text-slate-400">探勘時長</span>
            <span className="text-xs font-mono font-bold text-slate-200 tabular-nums">
              {formatTime(stats.timeElapsed)}
            </span>
          </div>
        </div>

        {/* Restart Button */}
        <button
          onClick={onRestart}
          className="flex items-center justify-center gap-2 py-3 px-8 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/20 transition-all hover:scale-105"
        >
          <RotateCcw className="w-4 h-4" />
          再次降落出擊
        </button>
      </div>
    </div>
  );
};
