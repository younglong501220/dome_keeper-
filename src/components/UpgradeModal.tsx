import React, { useState } from 'react';
import { X, Wrench, Shield, Zap, Sparkles, Cpu, Hammer } from 'lucide-react';
import { GameEngine } from '../game/gameEngine';
import { UPGRADE_CONFIG } from '../game/constants';
import { audio } from '../game/audio';

interface UpgradeModalProps {
  engine: GameEngine;
  onClose: () => void;
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({ engine, onClose }) => {
  const [activeTab, setActiveTab] = useState<'mining' | 'defense' | 'gadgets'>('mining');

  const { resources, upgrades, dome } = engine;

  const handleUpgrade = (type: string) => {
    if (type === 'drill' && upgrades.drill < 5) {
      const nextCfg = UPGRADE_CONFIG.drill[upgrades.drill];
      if (resources.iron >= nextCfg.costIron && resources.water >= nextCfg.costWater) {
        resources.iron -= nextCfg.costIron;
        resources.water -= nextCfg.costWater;
        upgrades.drill++;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'jetpack' && upgrades.jetpack < 5) {
      const nextCfg = UPGRADE_CONFIG.jetpack[upgrades.jetpack];
      if (resources.iron >= nextCfg.costIron && resources.water >= nextCfg.costWater) {
        resources.iron -= nextCfg.costIron;
        resources.water -= nextCfg.costWater;
        upgrades.jetpack++;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'carry' && upgrades.carryCapacity < 5) {
      const nextCfg = UPGRADE_CONFIG.carryCapacity[upgrades.carryCapacity];
      if (resources.iron >= nextCfg.costIron && resources.water >= nextCfg.costWater) {
        resources.iron -= nextCfg.costIron;
        resources.water -= nextCfg.costWater;
        upgrades.carryCapacity++;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'laserDmg' && upgrades.laserDamage < 5) {
      const nextCfg = UPGRADE_CONFIG.laserDamage[upgrades.laserDamage];
      if (resources.iron >= nextCfg.costIron && resources.water >= nextCfg.costWater) {
        resources.iron -= nextCfg.costIron;
        resources.water -= nextCfg.costWater;
        upgrades.laserDamage++;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'laserTurn' && upgrades.laserTurn < 4) {
      const nextCfg = UPGRADE_CONFIG.laserTurn[upgrades.laserTurn];
      if (resources.iron >= nextCfg.costIron && resources.water >= nextCfg.costWater) {
        resources.iron -= nextCfg.costIron;
        resources.water -= nextCfg.costWater;
        upgrades.laserTurn++;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'shield' && upgrades.shield < 3) {
      const nextCfg = UPGRADE_CONFIG.shield[upgrades.shield + 1];
      if (
        resources.iron >= nextCfg.costIron &&
        resources.water >= nextCfg.costWater &&
        resources.cobalt >= nextCfg.costCobalt
      ) {
        resources.iron -= nextCfg.costIron;
        resources.water -= nextCfg.costWater;
        resources.cobalt -= nextCfg.costCobalt;
        upgrades.shield++;
        dome.maxShield = nextCfg.maxShield;
        dome.shield = nextCfg.maxShield;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'beacon' && upgrades.teleportBeacon === 0) {
      const cfg = UPGRADE_CONFIG.teleportBeacon[1];
      if (
        resources.iron >= cfg.costIron &&
        resources.water >= cfg.costWater &&
        resources.cobalt >= cfg.costCobalt
      ) {
        resources.iron -= cfg.costIron;
        resources.water -= cfg.costWater;
        resources.cobalt -= cfg.costCobalt;
        upgrades.teleportBeacon = 1;
        audio.playUpgradeSuccess();
      }
    } else if (type === 'repair') {
      if (resources.cobalt >= 1 && dome.hp < dome.maxHp) {
        engine.repairDome();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Terminal Header */}
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Cpu className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="text-base font-bold text-slate-100">穹頂科技終端機</h2>
              <p className="text-xs text-slate-400">消耗採掘資源升級機體與防禦系統</p>
            </div>
          </div>

          {/* Resources Summary */}
          <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-mono">
            <span className="text-amber-300 font-bold">⚙ {resources.iron} 鐵</span>
            <span className="text-sky-300 font-bold">💧 {resources.water} 水</span>
            <span className="text-fuchsia-300 font-bold">💠 {resources.cobalt} 鈷</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('mining')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'mining'
                ? 'bg-slate-900 text-amber-400 border-t-2 border-amber-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Wrench className="w-4 h-4" />
            探測與採礦機體
          </button>
          <button
            onClick={() => setActiveTab('defense')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'defense'
                ? 'bg-slate-900 text-cyan-400 border-t-2 border-cyan-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-4 h-4" />
            穹頂雷射與外殼
          </button>
          <button
            onClick={() => setActiveTab('gadgets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold rounded-t-lg transition-colors ${
              activeTab === 'gadgets'
                ? 'bg-slate-900 text-emerald-400 border-t-2 border-emerald-500'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            特殊科技與維修
          </button>
        </div>

        {/* Upgrade Items List */}
        <div className="p-6 overflow-y-auto space-y-3.5 flex-1 custom-scrollbar">
          {/* TAB 1: MINING */}
          {activeTab === 'mining' && (
            <>
              {/* Drill */}
              {(() => {
                const lvl = upgrades.drill;
                const isMax = lvl >= 5;
                const nextCfg = !isMax ? UPGRADE_CONFIG.drill[lvl] : null;
                const canAfford =
                  nextCfg &&
                  resources.iron >= nextCfg.costIron &&
                  resources.water >= nextCfg.costWater;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20">
                        <Hammer className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">超音波鑽頭</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-mono font-semibold">
                            Lv.{lvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMax ? '已達最高強度！' : nextCfg?.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isMax || !canAfford}
                      onClick={() => handleUpgrade('drill')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已滿級' : `升級 (${nextCfg?.costIron} 鐵${nextCfg?.costWater ? `, ${nextCfg.costWater} 水` : ''})`}
                    </button>
                  </div>
                );
              })()}

              {/* Jetpack */}
              {(() => {
                const lvl = upgrades.jetpack;
                const isMax = lvl >= 5;
                const nextCfg = !isMax ? UPGRADE_CONFIG.jetpack[lvl] : null;
                const canAfford =
                  nextCfg &&
                  resources.iron >= nextCfg.costIron &&
                  resources.water >= nextCfg.costWater;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">噴射推進背包</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-sky-400 font-mono font-semibold">
                            Lv.{lvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMax ? '已達極速懸浮推力！' : nextCfg?.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isMax || !canAfford}
                      onClick={() => handleUpgrade('jetpack')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-sky-500 hover:bg-sky-400 text-slate-950 shadow-md shadow-sky-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已滿級' : `升級 (${nextCfg?.costIron} 鐵${nextCfg?.costWater ? `, ${nextCfg.costWater} 水` : ''})`}
                    </button>
                  </div>
                );
              })()}

              {/* Carry Tether */}
              {(() => {
                const lvl = upgrades.carryCapacity;
                const isMax = lvl >= 5;
                const nextCfg = !isMax ? UPGRADE_CONFIG.carryCapacity[lvl] : null;
                const canAfford =
                  nextCfg &&
                  resources.iron >= nextCfg.costIron &&
                  resources.water >= nextCfg.costWater;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
                        <Wrench className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">彈性牽引繩 & 阻尼負重</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-indigo-400 font-mono font-semibold">
                            Lv.{lvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMax ? '最大負重牽引能力已解鎖！' : nextCfg?.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isMax || !canAfford}
                      onClick={() => handleUpgrade('carry')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-indigo-500 hover:bg-indigo-400 text-slate-100 shadow-md shadow-indigo-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已滿級' : `升級 (${nextCfg?.costIron} 鐵${nextCfg?.costWater ? `, ${nextCfg.costWater} 水` : ''})`}
                    </button>
                  </div>
                );
              })()}
            </>
          )}

          {/* TAB 2: DEFENSE */}
          {activeTab === 'defense' && (
            <>
              {/* Laser Damage */}
              {(() => {
                const lvl = upgrades.laserDamage;
                const isMax = lvl >= 5;
                const nextCfg = !isMax ? UPGRADE_CONFIG.laserDamage[lvl] : null;
                const canAfford =
                  nextCfg &&
                  resources.iron >= nextCfg.costIron &&
                  resources.water >= nextCfg.costWater;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">聚能雷射核心</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-rose-400 font-mono font-semibold">
                            Lv.{lvl} / 5
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMax ? '毀滅級光子束已就緒！' : nextCfg?.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isMax || !canAfford}
                      onClick={() => handleUpgrade('laserDmg')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-rose-500 hover:bg-rose-400 text-slate-100 shadow-md shadow-rose-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已滿級' : `升級 (${nextCfg?.costIron} 鐵, ${nextCfg?.costWater} 水)`}
                    </button>
                  </div>
                );
              })()}

              {/* Laser Turn */}
              {(() => {
                const lvl = upgrades.laserTurn;
                const isMax = lvl >= 4;
                const nextCfg = !isMax ? UPGRADE_CONFIG.laserTurn[lvl] : null;
                const canAfford =
                  nextCfg &&
                  resources.iron >= nextCfg.costIron &&
                  resources.water >= nextCfg.costWater;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-cyan-500/10 rounded-lg text-cyan-400 border border-cyan-500/20">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">砲台瞄準轉軸</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono font-semibold">
                            Lv.{lvl} / 4
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMax ? '最高轉向靈敏度！' : nextCfg?.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isMax || !canAfford}
                      onClick={() => handleUpgrade('laserTurn')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax ? '已滿級' : `升級 (${nextCfg?.costIron} 鐵, ${nextCfg?.costWater} 水)`}
                    </button>
                  </div>
                );
              })()}

              {/* Overshield */}
              {(() => {
                const lvl = upgrades.shield;
                const isMax = lvl >= 3;
                const nextCfg = !isMax ? UPGRADE_CONFIG.shield[lvl + 1] : null;
                const canAfford =
                  nextCfg &&
                  resources.iron >= nextCfg.costIron &&
                  resources.water >= nextCfg.costWater &&
                  resources.cobalt >= nextCfg.costCobalt;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-purple-500/10 rounded-lg text-purple-400 border border-purple-500/20">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">電磁能量護盾</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-purple-400 font-mono font-semibold">
                            Lv.{lvl} / 3
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {isMax ? '護盾系統已完全過載防護！' : nextCfg?.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isMax || !canAfford}
                      onClick={() => handleUpgrade('shield')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isMax
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                          : canAfford
                          ? 'bg-purple-500 hover:bg-purple-400 text-slate-100 shadow-md shadow-purple-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isMax
                        ? '已滿級'
                        : `研發 (${nextCfg?.costIron} 鐵, ${nextCfg?.costWater} 水, ${nextCfg?.costCobalt} 鈷)`}
                    </button>
                  </div>
                );
              })()}
            </>
          )}

          {/* TAB 3: GADGETS & REPAIR */}
          {activeTab === 'gadgets' && (
            <>
              {/* Dome Repair */}
              <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-100">修復穹頂外殼 (+40 HP)</span>
                      <span className="text-xs text-slate-400">
                        當前: {Math.ceil(dome.hp)} / {dome.maxHp} HP
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      利用稀有鈷礦的高密合金修補穹頂裂痕
                    </p>
                  </div>
                </div>

                <button
                  disabled={resources.cobalt < 1 || dome.hp >= dome.maxHp}
                  onClick={() => handleUpgrade('repair')}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                    resources.cobalt >= 1 && dome.hp < dome.maxHp
                      ? 'bg-blue-600 hover:bg-blue-500 text-slate-100 shadow-md shadow-blue-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  修復 (1 鈷)
                </button>
              </div>

              {/* Quantum Teleport Lift */}
              {(() => {
                const isUnlocked = upgrades.teleportBeacon > 0;
                const cfg = UPGRADE_CONFIG.teleportBeacon[1];
                const canAfford =
                  resources.iron >= cfg.costIron &&
                  resources.water >= cfg.costWater &&
                  resources.cobalt >= cfg.costCobalt;

                return (
                  <div className="flex items-center justify-between p-4 bg-slate-950/60 rounded-xl border border-slate-800 hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-slate-100">地底量子傳送光柱</span>
                          <span className="text-xs px-2 py-0.5 rounded bg-slate-800 text-emerald-400 font-mono font-semibold">
                            {isUnlocked ? '已啟用' : '古代科技'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5 max-w-sm">
                          {cfg.desc}
                        </p>
                      </div>
                    </div>

                    <button
                      disabled={isUnlocked || !canAfford}
                      onClick={() => handleUpgrade('beacon')}
                      className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                        isUnlocked
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-700 cursor-default'
                          : canAfford
                          ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      {isUnlocked ? '已就緒' : `啟動 (${cfg.costIron} 鐵, ${cfg.costWater} 水, ${cfg.costCobalt} 鈷)`}
                    </button>
                  </div>
                );
              })()}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-6 py-3 bg-slate-950/80 border-t border-slate-800 text-center text-xs text-slate-400">
          按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">U</kbd> 或{' '}
          <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">ESC</kbd> 關閉終端機
        </div>
      </div>
    </div>
  );
};
