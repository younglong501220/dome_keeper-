class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.7;

  // Persistent nodes
  private laserOsc: OscillatorNode | null = null;
  private laserGain: GainNode | null = null;
  private laserFilter: BiquadFilterNode | null = null;

  // Throttle timestamps to prevent audio node flooding
  private lastDigTime = 0;
  private lastHitTime = 0;
  private lastAlarmTime = 0;
  private lastDeliverTime = 0;

  public init() {
    try {
      if (!this.ctx) {
        const AudioCtxClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        if (AudioCtxClass) {
          this.ctx = new AudioCtxClass();
        }
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    } catch {
      // AudioContext blocked or unsupported
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (muted) {
      this.stopLaserLoop();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.laserGain && this.ctx) {
      this.laserGain.gain.setValueAtTime(0.12 * this.volume, this.ctx.currentTime);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  // --- Sound Effects with Throttling ---

  public playDig(depth: number = 0) {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastDigTime < 70) return; // Max ~14 dig sounds per sec
    this.lastDigTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      const baseFreq = Math.max(60, 150 - depth * 1.5) + (Math.random() - 0.5) * 25;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(35, t + 0.06);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(400, t);

      gain.gain.setValueAtTime(0.14 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.06);
    } catch {
      // Ignore audio glitch
    }
  }

  public playMineComplete() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(50, t + 0.1);
      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.1);
    } catch {
      // Ignore
    }
  }

  public playTetherAttach() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(420, t);
      osc.frequency.exponentialRampToValueAtTime(680, t + 0.07);
      gain.gain.setValueAtTime(0.1 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.07);
    } catch {
      // Ignore
    }
  }

  public playResourceDeliver(type: string) {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastDeliverTime < 50) return;
    this.lastDeliverTime = now;

    try {
      const t = this.ctx.currentTime;
      let baseFreq = 523.25; // C5
      if (type === 'water') baseFreq = 659.25;
      else if (type === 'cobalt') baseFreq = 783.99;
      else if (type === 'relic') baseFreq = 1046.5;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(baseFreq, t);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.4, t + 0.15);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.18);
    } catch {
      // Ignore
    }
  }

  public startLaserLoop() {
    if (this.isMuted || !this.ctx) return;
    if (this.laserOsc) return;

    try {
      const t = this.ctx.currentTime;
      this.laserOsc = this.ctx.createOscillator();
      this.laserGain = this.ctx.createGain();
      this.laserFilter = this.ctx.createBiquadFilter();

      this.laserOsc.type = 'sawtooth';
      this.laserOsc.frequency.setValueAtTime(220, t);

      this.laserFilter.type = 'lowpass';
      this.laserFilter.frequency.setValueAtTime(650, t);

      this.laserGain.gain.setValueAtTime(0.001, t);
      this.laserGain.gain.linearRampToValueAtTime(0.12 * this.volume, t + 0.05);

      this.laserOsc.connect(this.laserFilter);
      this.laserFilter.connect(this.laserGain);
      this.laserGain.connect(this.ctx.destination);

      this.laserOsc.start();
    } catch {
      this.laserOsc = null;
    }
  }

  public stopLaserLoop() {
    if (!this.laserOsc || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      this.laserGain?.gain.linearRampToValueAtTime(0.001, t + 0.04);
      const oldOsc = this.laserOsc;
      setTimeout(() => {
        try {
          oldOsc.stop();
          oldOsc.disconnect();
        } catch {
          // ignore
        }
      }, 50);
    } catch {
      // ignore
    } finally {
      this.laserOsc = null;
      this.laserGain = null;
      this.laserFilter = null;
    }
  }

  public playLaserHit() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastHitTime < 120) return; // Throttle hits
    this.lastHitTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(320 + (Math.random() - 0.5) * 80, t);
      osc.frequency.exponentialRampToValueAtTime(100, t + 0.05);

      gain.gain.setValueAtTime(0.07 * this.volume, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.05);
    } catch {
      // Ignore
    }
  }

  public playEnemyDeath(isFlyer: boolean = false) {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = isFlyer ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(isFlyer ? 220 : 130, t);
      osc.frequency.exponentialRampToValueAtTime(30, t + 0.14);

      gain.gain.setValueAtTime(0.2 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.14);
    } catch {
      // Ignore
    }
  }

  public playDomeDamage() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastHitTime < 140) return;
    this.lastHitTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(90, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 0.22);

      gain.gain.setValueAtTime(0.25 * this.volume, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {
      // Ignore
    }
  }

  public playAlarmBeep() {
    if (this.isMuted || !this.ctx) return;
    const now = performance.now();
    if (now - this.lastAlarmTime < 800) return; // Exactly at most once per 800ms
    this.lastAlarmTime = now;

    try {
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(480, t);
      osc.frequency.linearRampToValueAtTime(720, t + 0.2);

      gain.gain.setValueAtTime(0.16 * this.volume, t);
      gain.gain.linearRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.22);
    } catch {
      // Ignore
    }
  }

  public playUpgradeSuccess() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [392, 523.25, 659.25, 783.99];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t + i * 0.05);

        gain.gain.setValueAtTime(0.15 * this.volume, t + i * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.05 + 0.16);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.05);
        osc.stop(t + i * 0.05 + 0.16);
      });
    } catch {
      // Ignore
    }
  }

  public playRelicDiscovered() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, i) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + i * 0.09);
        gain.gain.setValueAtTime(0.18 * this.volume, t + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, t + i * 0.09 + 0.3);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + i * 0.09);
        osc.stop(t + i * 0.09 + 0.3);
      });
    } catch {
      // Ignore
    }
  }

  public playVictory() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t + idx * 0.12);
        gain.gain.setValueAtTime(0.2 * this.volume, t + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.12 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.12);
        osc.stop(t + idx * 0.12 + 0.6);
      });
    } catch {
      // Ignore
    }
  }

  public playGameOver() {
    if (this.isMuted || !this.ctx) return;
    try {
      const t = this.ctx.currentTime;
      const notes = [330, 293, 220];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(freq, t + idx * 0.16);
        gain.gain.setValueAtTime(0.2 * this.volume, t + idx * 0.16);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.16 + 0.4);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.16);
        osc.stop(t + idx * 0.16 + 0.4);
      });
    } catch {
      // Ignore
    }
  }
}

export const audio = new SoundManager();
