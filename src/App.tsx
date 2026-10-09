import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { HUD } from './components/HUD';
import { UpgradeModal } from './components/UpgradeModal';
import { TouchControls } from './components/TouchControls';
import { PauseModal } from './components/PauseModal';
import { GameOverModal } from './components/GameOverModal';
import { HowToPlayModal } from './components/HowToPlayModal';
import { audio } from './game/audio';
import { GameState } from './game/types';
import { Volume2, VolumeX, ShieldCheck } from 'lucide-react';

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>('PLAYING');
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isGameFocused, setIsGameFocused] = useState(true);
  const [, setTick] = useState(0);

  const isUpgradeOpenRef = useRef(false);
  isUpgradeOpenRef.current = isUpgradeOpen;

  const isHelpOpenRef = useRef(false);
  isHelpOpenRef.current = isHelpOpen;

  const isMutedRef = useRef(false);
  isMutedRef.current = isMuted;

  const toggleMute = useCallback(() => {
    audio.init();
    setIsMuted((prev) => {
      const next = !prev;
      audio.setMuted(next);
      return next;
    });
  }, []);

  // Initialize engine once canvas mounts
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new GameEngine(canvas);
    engineRef.current = engine;

    engine.onStateChange = (newState) => {
      setGameState(newState);
    };

    engine.onStatsUpdate = () => {
      setTick((t) => (t + 1) % 1000);
    };

    // Auto-start immediately
    engine.start();

    // Auto-focus canvas so keyboard events register immediately without extra click
    const focusTimer = setTimeout(() => {
      canvas.focus();
    }, 60);

    // Keyboard handlers
    const handleKeyDown = (e: KeyboardEvent) => {
      audio.init();
      const k = e.key.toLowerCase();

      // Prevent browser scroll for navigation and game keys
      if (
        ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code) ||
        ['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)
      ) {
        e.preventDefault();
      }

      if (e.code === 'KeyM' || k === 'm') {
        toggleMute();
        return;
      }

      if (e.code === 'Escape') {
        if (isUpgradeOpenRef.current) {
          setIsUpgradeOpen(false);
          return;
        }
        if (isHelpOpenRef.current) {
          setIsHelpOpen(false);
          return;
        }
        if (engine.state === 'PLAYING') {
          engine.pause();
        } else if (engine.state === 'PAUSED') {
          engine.resume();
        }
        return;
      }

      // If a modal is open, ignore in-game movement keys to avoid moving in background
      if (isUpgradeOpenRef.current || isHelpOpenRef.current) {
        return;
      }

      if (e.code === 'KeyP' || k === 'p') {
        if (engine.state === 'PLAYING') engine.pause();
        else if (engine.state === 'PAUSED') engine.resume();
        return;
      }

      if (e.code === 'KeyE' || k === 'e') {
        if (engine.player.inDome) {
          engine.toggleLaserMode();
        } else {
          engine.addFloatingText(engine.player.x, engine.player.y - 15, '需在穹頂內才能操縱雷射砲！', '#f59e0b');
        }
        return;
      }

      if (e.code === 'KeyU' || k === 'u') {
        setIsUpgradeOpen((prev) => !prev);
        return;
      }

      engine.keys[e.code] = true;
      engine.keys[e.key] = true;
      engine.keys[k] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (engineRef.current) {
        const k = e.key.toLowerCase();
        engineRef.current.keys[e.code] = false;
        engineRef.current.keys[e.key] = false;
        engineRef.current.keys[k] = false;
      }
    };

    // Pointer events for smooth laser aiming across window and canvas
    const updatePointerPos = (clientX: number, clientY: number) => {
      const cvs = canvasRef.current;
      if (!cvs || !engineRef.current) return;
      const rect = cvs.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        const scaleX = cvs.width / rect.width;
        const scaleY = cvs.height / rect.height;
        engineRef.current.mousePos.x = (clientX - rect.left) * scaleX;
        engineRef.current.mousePos.y = (clientY - rect.top) * scaleY;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      audio.init();
      canvas.focus();
      setIsGameFocused(true);
      updatePointerPos(e.clientX, e.clientY);

      if (engineRef.current) {
        engineRef.current.mousePos.isDown = true;

        // Quick shortcut: if inside dome and clicking sky, activate laser mode!
        const eng = engineRef.current;
        if (eng.player.inDome && !eng.player.controllingLaser) {
          const worldY = eng.mousePos.y + eng.camera.y;
          if (worldY < eng.dome.y) {
            eng.toggleLaserMode();
          }
        }
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      updatePointerPos(e.clientX, e.clientY);
    };

    const handlePointerUp = () => {
      if (engineRef.current) {
        engineRef.current.mousePos.isDown = false;
      }
    };

    const handleWindowBlur = () => {
      setIsGameFocused(false);
      // Reset all keys on blur so character doesn't get stuck walking
      if (engineRef.current) {
        engineRef.current.keys = {};
        engineRef.current.mousePos.isDown = false;
      }
    };

    const handleCanvasFocus = () => {
      setIsGameFocused(true);
    };

    window.addEventListener('keydown', handleKeyDown, { passive: false });
    window.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('keydown', handleKeyDown, { passive: false });
    canvas.addEventListener('keyup', handleKeyUp);
    canvas.addEventListener('pointerdown', handlePointerDown);
    canvas.addEventListener('pointermove', handlePointerMove);
    canvas.addEventListener('focus', handleCanvasFocus);
    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      clearTimeout(focusTimer);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('keydown', handleKeyDown);
      canvas.removeEventListener('keyup', handleKeyUp);
      canvas.removeEventListener('pointerdown', handlePointerDown);
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('focus', handleCanvasFocus);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      engine.stop();
    };
  }, [toggleMute]);

  const handleRestart = () => {
    audio.init();
    if (!engineRef.current) return;
    engineRef.current.resetGame();
    engineRef.current.start();
    setIsUpgradeOpen(false);
    setIsHelpOpen(false);
  };

  const handleResume = () => {
    if (!engineRef.current) return;
    engineRef.current.resume();
  };

  return (
    <div className="min-h-screen bg-[#080a11] text-slate-100 flex flex-col items-center justify-between selection:bg-amber-500/30 overflow-x-hidden font-sans">
      {/* 3-Zone Top Bar Contract */}
      <header className="w-full max-w-7xl flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md z-30">
        {/* Zone 1: Single text element wordmark */}
        <span className="text-lg font-black tracking-wider text-slate-100 whitespace-nowrap shrink-0 flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_10px_#f59e0b]" />
          DOME KEEPER 穹頂守護者
        </span>

        {/* Zone 2: Clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold text-slate-400">
          <button
            onClick={() => setIsHelpOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            指揮官指南
          </button>
          <button
            onClick={() => setIsUpgradeOpen(true)}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            科技樹終端
          </button>
          <button
            onClick={toggleMute}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
            <span>{isMuted ? '靜音中' : '聲音開啟'}</span>
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleRestart}
            className="px-3 py-1.5 text-xs font-bold text-slate-300 hover:text-slate-100 bg-slate-800/80 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0 border border-slate-700"
            title="重新啟動新探勘"
          >
            重新出發
          </button>
          <button
            onClick={() => {
              if (gameState === 'PLAYING') engineRef.current?.pause();
              else if (gameState === 'PAUSED') engineRef.current?.resume();
            }}
            className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-md shadow-amber-500/20"
          >
            {gameState === 'PAUSED' ? '繼續遊戲' : '暫停遊戲'}
          </button>
        </div>
      </header>

      {/* Main Game Arena Container */}
      <main className="w-full flex-1 flex flex-col items-center justify-center p-2 sm:p-4 relative">
        <div
          onClick={() => canvasRef.current?.focus()}
          className={`relative w-full max-w-[1020px] aspect-[15/10] max-h-[700px] rounded-2xl overflow-hidden border-2 shadow-[0_20px_50px_rgba(0,0,0,0.9)] bg-slate-950 flex items-center justify-center transition-all ${
            isGameFocused ? 'border-amber-500/60 ring-2 ring-amber-500/20' : 'border-slate-800/90'
          }`}
        >
          {/* Main 2D Canvas with active focus intercept */}
          <canvas
            ref={canvasRef}
            tabIndex={0}
            width={1008}
            height={672}
            className="w-full h-full object-contain block select-none bg-[#0a0d17] outline-none cursor-crosshair"
            style={{ touchAction: 'none' }}
          />

          {/* Active Gameplay HUD */}
          {gameState === 'PLAYING' && (
            <HUD
              engine={engineRef.current}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
              onOpenHelp={() => setIsHelpOpen(true)}
              onTogglePause={() => engineRef.current?.pause()}
              onToggleMute={toggleMute}
              isMuted={isMuted}
            />
          )}

          {/* Virtual Mobile / Tablet Touch Controls */}
          {gameState === 'PLAYING' && engineRef.current && (
            <TouchControls
              engine={engineRef.current}
              onOpenUpgrade={() => setIsUpgradeOpen(true)}
            />
          )}

          {/* PAUSED MODAL */}
          {gameState === 'PAUSED' && engineRef.current && (
            <PauseModal
              engine={engineRef.current}
              onResume={handleResume}
              onRestart={handleRestart}
              isMuted={isMuted}
              onToggleMute={toggleMute}
            />
          )}

          {/* GAME OVER OR VICTORY MODAL */}
          {(gameState === 'GAME_OVER' || gameState === 'VICTORY') && engineRef.current && (
            <GameOverModal
              isVictory={gameState === 'VICTORY'}
              stats={engineRef.current.stats}
              wave={engineRef.current.wave}
              onRestart={handleRestart}
            />
          )}

          {/* UPGRADE TERMINAL MODAL */}
          {isUpgradeOpen && engineRef.current && (
            <UpgradeModal
              engine={engineRef.current}
              onClose={() => setIsUpgradeOpen(false)}
            />
          )}

          {/* HOW TO PLAY MODAL */}
          {isHelpOpen && (
            <HowToPlayModal onClose={() => setIsHelpOpen(false)} />
          )}
        </div>

        {/* Bottom Keybinds bar */}
        <div className="mt-3 flex items-center justify-center flex-wrap gap-4 text-xs text-slate-400">
          <span>
            移動採礦：<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">W/A/S/D</kbd>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            雷射砲台：<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">E</kbd> (瞄準射擊)
          </span>
          <span aria-hidden="true">·</span>
          <span>
            科技終端：<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">U</kbd>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            暫停：<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">P</kbd> / <kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">ESC</kbd>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            靜音：<kbd className="px-1.5 py-0.5 bg-slate-800 border border-slate-700 rounded text-slate-200 font-mono">M</kbd>
          </span>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl px-6 py-3 border-t border-slate-800/80 text-center text-xs text-slate-400 flex items-center justify-between">
        <span>© 2026 Dome Keeper 穹頂守護者 · 網頁忠實致敬版</span>
        <span className="flex items-center gap-1.5 text-slate-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          Web Audio 合成音效 · Canvas 原生 60FPS
        </span>
      </footer>
    </div>
  );
}
