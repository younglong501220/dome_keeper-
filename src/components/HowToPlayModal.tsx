import React from 'react';
import { X, Pickaxe, Shield, Compass, Sparkles, Crosshair } from 'lucide-react';

interface HowToPlayModalProps {
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100">穹頂守護者 · 指揮官操作指南</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Sections */}
        <div className="py-4 space-y-4 text-xs text-slate-300 leading-relaxed">
          {/* 1. Mining Loop */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400 border border-amber-500/20 shrink-0">
              <Pickaxe className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-amber-300">1. 地底探勘與物理牽引</h3>
              <p className="text-slate-400 mt-1">
                使用 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">W/A/S/D</kbd> 或方向鍵操控機體。向岩石方向持續移動即可進行挖掘。
                靠近挖掘掉落的礦石（鐵、水、鈷）會自動連結<strong>彈性物理牽引繩</strong>拖回穹頂。注意：攜帶過多礦石會增加重量並減緩速度！
              </p>
            </div>
          </div>

          {/* 2. Siren & Defense */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 bg-rose-500/10 rounded-lg text-rose-400 border border-rose-500/20 shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-rose-300">2. 警報倒數與回防穹頂</h3>
              <p className="text-slate-400 mt-1">
                畫面頂端顯示波次襲擊倒數計時。最後 7 秒會觸發<strong>紅色緊急警報</strong>！務必提前從地底爬回穹頂。
                在穹頂內按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">E</kbd> 鍵可切換至<strong>雷射砲台操作</strong>，使用 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">A/D</kbd> 或滑鼠精確瞄準擊退空中飛獸與地面爬蟲！
              </p>
            </div>
          </div>

          {/* 3. Tech Upgrade */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 bg-sky-500/10 rounded-lg text-sky-400 border border-sky-500/20 shrink-0">
              <Crosshair className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-sky-300">3. 科技樹終端機</h3>
              <p className="text-slate-400 mt-1">
                在穹頂內按 <kbd className="px-1.5 py-0.5 bg-slate-800 rounded text-slate-200 font-mono">U</kbd> 鍵開啟升級終端。
                升級<strong>鑽頭威力</strong>能迅速攻克深層花崗岩與黑曜極岩；升級<strong>噴射背包與牽引繩</strong>能一次運送更多礦產；提升<strong>雷射傷害與轉速</strong>確保穹頂屹立不搖。
              </p>
            </div>
          </div>

          {/* 4. Relic Hunt */}
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-start gap-3">
            <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400 border border-yellow-500/20 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-yellow-300">4. 終極目標：古代遺跡核心</h3>
              <p className="text-slate-400 mt-1">
                在最深層岩核中埋藏著巨大的金色<strong>古代遺跡核心</strong>。挖掘出並全力將其拖回穹頂，啟動核心裝置並在最後決戰波次中生存下來即可取得大獲全勝！
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-slate-100 rounded-xl font-bold text-xs shadow-md transition-colors mt-2"
        >
          我準備好了，開始守護！
        </button>
      </div>
    </div>
  );
};
