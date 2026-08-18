/**
 * Web Audio API procedural sound engine for Neon Space Defender.
 * Pure native browser audio - zero external assets needed.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private sfxGain: GainNode | null = null;
  private musicGain: GainNode | null = null;
  
  private isSfxMuted: boolean = false;
  private isMusicMuted: boolean = false;
  private masterVolume: number = 0.8;
  
  // Background music sequencer
  private isMusicPlaying: boolean = false;
  private musicIntervalId: number | null = null;
  private musicStep: number = 0;
  private tempo: number = 132; // BPM

  constructor() {
    // Lazy initialize on first user interaction to comply with autoplay policy
  }

  public init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtxClass();
      
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.masterVolume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(this.isSfxMuted ? 0 : 0.8, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(this.isMusicMuted ? 0 : 0.45, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);

      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    } catch {
      console.warn('Web Audio API not supported or blocked in this browser.');
    }
  }

  public setMasterVolume(vol: number) {
    this.masterVolume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.masterVolume, this.ctx.currentTime, 0.05);
    }
  }

  public toggleSfx(enabled?: boolean) {
    this.isSfxMuted = enabled !== undefined ? !enabled : !this.isSfxMuted;
    if (this.sfxGain && this.ctx) {
      this.sfxGain.gain.setTargetAtTime(this.isSfxMuted ? 0 : 0.8, this.ctx.currentTime, 0.05);
    }
    return !this.isSfxMuted;
  }

  public toggleMusic(enabled?: boolean) {
    this.isMusicMuted = enabled !== undefined ? !enabled : !this.isMusicMuted;
    if (this.musicGain && this.ctx) {
      this.musicGain.gain.setTargetAtTime(this.isMusicMuted ? 0 : 0.45, this.ctx.currentTime, 0.05);
    }
    if (!this.isMusicMuted && !this.isMusicPlaying) {
      this.startMusic();
    } else if (this.isMusicMuted && this.isMusicPlaying) {
      this.stopMusic();
    }
    return !this.isMusicMuted;
  }

  public isSfxOn() {
    return !this.isSfxMuted;
  }

  public isMusicOn() {
    return !this.isMusicMuted;
  }

  public getVolume() {
    return this.masterVolume;
  }

  // --- SOUND EFFECTS ---

  public playLaser(isTriple: boolean = false, isRapid: boolean = false) {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = isRapid ? 'triangle' : 'sawtooth';
    
    const startFreq = isTriple ? 980 : (isRapid ? 880 : 750);
    const endFreq = isTriple ? 220 : 160;
    const duration = isRapid ? 0.09 : 0.14;

    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.exponentialRampToValueAtTime(endFreq, t + duration);

    gain.gain.setValueAtTime(0.22, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + duration + 0.01);

    if (isTriple) {
      // Secondary harmonic
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(startFreq * 1.5, t);
      osc2.frequency.exponentialRampToValueAtTime(endFreq * 1.5, t + duration);
      gain2.gain.setValueAtTime(0.12, t);
      gain2.gain.exponentialRampToValueAtTime(0.001, t + duration);
      osc2.connect(gain2);
      gain2.connect(this.sfxGain);
      osc2.start(t);
      osc2.stop(t + duration + 0.01);
    }
  }

  public playExplosion(intensity: 'small' | 'medium' | 'boss' = 'medium') {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const duration = intensity === 'boss' ? 1.2 : (intensity === 'medium' ? 0.45 : 0.25);
    
    // Create white noise buffer
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;

    // Filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    const cutoff = intensity === 'boss' ? 600 : (intensity === 'medium' ? 900 : 1200);
    filter.frequency.setValueAtTime(cutoff, t);
    filter.frequency.exponentialRampToValueAtTime(40, t + duration);

    // Gain envelope
    const gain = this.ctx.createGain();
    const peakGain = intensity === 'boss' ? 0.6 : (intensity === 'medium' ? 0.35 : 0.2);
    gain.gain.setValueAtTime(peakGain, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    whiteNoise.start(t);
    whiteNoise.stop(t + duration);

    // Add sub-bass punch
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(intensity === 'boss' ? 140 : 110, t);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + (duration * 0.7));
    
    subGain.gain.setValueAtTime(intensity === 'boss' ? 0.5 : 0.3, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + (duration * 0.7));

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);
    subOsc.start(t);
    subOsc.stop(t + duration * 0.7);
  }

  public playPowerup(type: string) {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = type === 'NUKE_BOMB' ? [220, 440, 880, 1760] : [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    const stepDuration = 0.06;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t + idx * stepDuration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.25, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.15);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.16);
    });
  }

  public playShieldHit() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(300, t + 0.2);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.22);
  }

  public playPlayerHit() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.linearRampToValueAtTime(60, t + 0.35);

    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.36);
  }

  public playBombBlast() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    // Massive explosion with reverse filter sweep + bass drop
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(120, t);
    osc.frequency.exponentialRampToValueAtTime(25, t + 0.9);

    gain.gain.setValueAtTime(0.6, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.92);

    this.playExplosion('boss');
  }

  public playGameOver() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [440, 415.3, 392, 349.23, 293.66]; // A4, Ab4, G4, F4, D4
    const stepDuration = 0.18;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t + idx * stepDuration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.3, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + stepDuration * 1.5);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + stepDuration * 1.6);
    });
  }

  public playWaveClear() {
    if (this.isSfxMuted) return;
    this.init();
    if (!this.ctx || !this.sfxGain) return;

    const t = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C E G C E
    const stepDuration = 0.08;

    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.sfxGain) return;
      const noteTime = t + idx * stepDuration;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.25);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.26);
    });
  }

  // --- PROCEDURAL SYNTHWAVE BGM SEQUENCER ---

  public startMusic() {
    if (this.isMusicPlaying || this.isMusicMuted) return;
    this.init();
    if (!this.ctx || !this.musicGain) return;

    this.isMusicPlaying = true;
    this.musicStep = 0;

    const stepInterval = (60 / this.tempo / 4) * 1000; // 16th note in ms

    // Bass line notes (D minor / F / C / G)
    const bassline = [
      73.42, 73.42, 73.42, 73.42, 73.42, 73.42, 73.42, 73.42, // D2
      87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, 87.31, // F2
      65.41, 65.41, 65.41, 65.41, 65.41, 65.41, 65.41, 65.41, // C2
      98.00, 98.00, 98.00, 98.00, 82.41, 82.41, 73.42, 73.42  // G2 / E2 / D2
    ];

    // Arpeggio notes (D4, F4, A4, C5, D5, etc.)
    const arpNotes = [
      293.66, 349.23, 440.00, 523.25, 587.33, 523.25, 440.00, 349.23,
      349.23, 440.00, 523.25, 659.25, 698.46, 659.25, 523.25, 440.00,
      261.63, 329.63, 392.00, 523.25, 587.33, 523.25, 392.00, 329.63,
      392.00, 440.00, 523.25, 587.33, 659.25, 587.33, 523.25, 440.00
    ];

    this.musicIntervalId = window.setInterval(() => {
      if (!this.ctx || !this.musicGain || !this.isMusicPlaying || this.isMusicMuted) return;

      const t = this.ctx.currentTime;
      const step = this.musicStep % 32;

      // Bass synth note on 16ths
      if (step % 2 === 0) {
        const bassOsc = this.ctx.createOscillator();
        const bassFilter = this.ctx.createBiquadFilter();
        const bassEnv = this.ctx.createGain();

        bassOsc.type = 'sawtooth';
        bassOsc.frequency.setValueAtTime(bassline[step], t);

        bassFilter.type = 'lowpass';
        bassFilter.frequency.setValueAtTime(380, t);
        bassFilter.frequency.exponentialRampToValueAtTime(100, t + 0.12);

        bassEnv.gain.setValueAtTime(0.18, t);
        bassEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

        bassOsc.connect(bassFilter);
        bassFilter.connect(bassEnv);
        bassEnv.connect(this.musicGain);

        bassOsc.start(t);
        bassOsc.stop(t + 0.13);
      }

      // Arpeggio synth lead
      if (step % 2 === 0 || (step % 4 === 1 && Math.random() > 0.4)) {
        const arpOsc = this.ctx.createOscillator();
        const arpEnv = this.ctx.createGain();

        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(arpNotes[step], t);

        arpEnv.gain.setValueAtTime(0.09, t);
        arpEnv.gain.exponentialRampToValueAtTime(0.001, t + 0.1);

        arpOsc.connect(arpEnv);
        arpEnv.connect(this.musicGain);

        arpOsc.start(t);
        arpOsc.stop(t + 0.11);
      }

      // Synth Hi-Hat on off-beats
      if (step % 4 === 2) {
        const hhGain = this.ctx.createGain();
        const hhFilter = this.ctx.createBiquadFilter();
        hhFilter.type = 'highpass';
        hhFilter.frequency.setValueAtTime(7000, t);

        const buffer = this.ctx.createBuffer(1, 1024, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < 1024; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const hhSource = this.ctx.createBufferSource();
        hhSource.buffer = buffer;

        hhGain.gain.setValueAtTime(0.04, t);
        hhGain.gain.exponentialRampToValueAtTime(0.001, t + 0.04);

        hhSource.connect(hhFilter);
        hhFilter.connect(hhGain);
        hhGain.connect(this.musicGain);

        hhSource.start(t);
        hhSource.stop(t + 0.05);
      }

      this.musicStep++;
    }, stepInterval);
  }

  public stopMusic() {
    this.isMusicPlaying = false;
    if (this.musicIntervalId !== null) {
      clearInterval(this.musicIntervalId);
      this.musicIntervalId = null;
    }
  }
}

export const sound = new SoundEngine();
