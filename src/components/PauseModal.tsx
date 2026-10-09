import React from 'react';
import { Play, RotateCcw, Volume2, VolumeX, Settings, ShieldAlert } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { audio } from '../game/audio';
import { GameDifficulty } from '../game/types';

interface PauseModalProps {
  engine: GameEngine;
  onResume: () => void;
  onRestart: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  engine,
  onResume,
  onRestart,
  isMuted,
  onToggleMute,
}) => {
  const [vol, setVol] = React.useState(audio.getVolume());

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVol(val);
    audio.setVolume(val);
  };

  const setDifficulty = (diff: GameDifficulty) => {
    engine.difficulty = diff;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col gap-5">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-100 flex items-center justify-center gap-2">
            <Settings className="w-5 h-5 text-amber-400" />
            遊戲已暫停
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            當前波次：第 {engine.wave} 波 · 深度：{engine.stats.maxDepthReached}m
          </p>
        </div>

        {/* Audio settings */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-300">音效總音量</span>
            <button
              onClick={onToggleMute}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200"
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 text-rose-400" />
                  <span>已靜音</span>
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 text-emerald-400" />
                  <span>已開啟</span>
                </>
              )}
            </button>
          </div>

          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={vol}
            onChange={handleVolumeChange}
            className="w-full accent-amber-500 cursor-pointer"
          />
        </div>

        {/* Difficulty Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-400">遊戲難度 (重開局生效)</label>
          <div className="grid grid-cols-3 gap-2">
            {(['EASY', 'NORMAL', 'HARD'] as GameDifficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                  engine.difficulty === d
                    ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                    : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:text-slate-200'
                }`}
              >
                {d === 'EASY' ? '輕鬆探險' : d === 'NORMAL' ? '標準防守' : '殘酷惡境'}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2.5 pt-2">
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-2 py-3 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 transition-colors"
          >
            <Play className="w-4 h-4" />
            繼續守護穹頂
          </button>

          <button
            onClick={onRestart}
            className="flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-medium text-xs transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            重新開始挑戰
          </button>
        </div>
      </div>
    </div>
  );
};
