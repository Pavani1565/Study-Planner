/**
 * Web Audio API synthesizer for study timer alerts and continuous focus ambient soundscapes.
 * Completely offline and self-contained with no external mp3 assets needed.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Alert Chimes
export function playAlert(type: 'complete' | 'start' | 'break' | 'check' | 'flip') {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;

    if (type === 'complete') {
      // Triumphant 3-note chime (C5 -> E5 -> G5)
      const freqs = [523.25, 659.25, 783.99, 1046.50];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(f, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.7);
      });
    } else if (type === 'start') {
      // Uplifting ascending chime
      const freqs = [440, 554.37, 659.25];
      freqs.forEach((f, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, now + idx * 0.08);

        gain.gain.setValueAtTime(0.001, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.18, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.08 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.45);
      });
    } else if (type === 'break') {
      // Gentle soothing bell
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now); // Natural 432Hz

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.3, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 1.3);
    } else if (type === 'check') {
      // Crisp subtle checkmark click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(900, now + 0.08);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } else if (type === 'flip') {
      // Card flip whoosh
      const bufferSize = ctx.sampleRate * 0.08;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.12, now);
      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);
    }
  } catch (e) {
    console.warn("Audio playback not permitted or supported yet", e);
  }
}

// 2. Ambient Sound Generator Nodes
export type AmbientSoundType = 'off' | 'rain' | 'brown' | 'alpha' | 'cafe';

class AmbientEngine {
  private activeType: AmbientSoundType = 'off';
  private nodes: (AudioNode | number)[] = [];
  private masterGain: GainNode | null = null;
  private volume: number = 0.3;

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && audioCtx) {
      this.masterGain.gain.setTargetAtTime(this.volume, audioCtx.currentTime, 0.1);
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentType(): AmbientSoundType {
    return this.activeType;
  }

  public stop() {
    if (!audioCtx) return;
    this.nodes.forEach(node => {
      if (typeof node === 'number') {
        window.clearInterval(node);
      } else {
        try {
          if ('stop' in node && typeof (node as any).stop === 'function') {
            (node as any).stop();
          }
          node.disconnect();
        } catch (_) {}
      }
    });
    this.nodes = [];
    this.activeType = 'off';
  }

  public play(type: AmbientSoundType) {
    this.stop();
    if (type === 'off') return;

    try {
      const ctx = getAudioContext();
      this.activeType = type;

      const master = ctx.createGain();
      master.gain.setValueAtTime(0.001, ctx.currentTime);
      master.gain.exponentialRampToValueAtTime(this.volume, ctx.currentTime + 0.8);
      master.connect(ctx.destination);
      this.masterGain = master;

      if (type === 'brown') {
        // Deep warm brown noise (Brownian random walk)
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          data[i] = (lastOut + (0.02 * white)) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5; // boost
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 450;

        source.connect(filter);
        filter.connect(master);
        source.start();
        this.nodes.push(source, filter);

      } else if (type === 'rain') {
        // Soft rainfall noise
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const lowpass = ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.value = 1000;

        const highpass = ctx.createBiquadFilter();
        highpass.type = 'highpass';
        highpass.frequency.value = 200;

        source.connect(lowpass);
        lowpass.connect(highpass);
        highpass.connect(master);
        source.start();
        this.nodes.push(source, lowpass, highpass);

      } else if (type === 'alpha') {
        // 40Hz Gamma / 10Hz Alpha binaural rhythm (grounded on 200Hz base)
        const baseFreq = 216;
        const diff = 10; // 10Hz Alpha brainwave target

        const oscL = ctx.createOscillator();
        const oscR = ctx.createOscillator();
        oscL.type = 'sine';
        oscR.type = 'sine';
        oscL.frequency.value = baseFreq;
        oscR.frequency.value = baseFreq + diff;

        const gainL = ctx.createGain();
        const gainR = ctx.createGain();
        gainL.gain.value = 0.5;
        gainR.gain.value = 0.5;

        oscL.connect(gainL);
        oscR.connect(gainR);
        gainL.connect(master);
        gainR.connect(master);

        oscL.start();
        oscR.start();
        this.nodes.push(oscL, oscR, gainL, gainR);

      } else if (type === 'cafe') {
        // Soft warm coffeehouse murmur simulation
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < bufferSize; i++) {
          const w = Math.random() * 2 - 1;
          data[i] = (last + (0.05 * w)) / 1.05;
          last = data[i];
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 600;
        filter.Q.value = 0.7;

        source.connect(filter);
        filter.connect(master);
        source.start();
        this.nodes.push(source, filter);
      }
    } catch (e) {
      console.warn("Ambient sound error:", e);
    }
  }
}

export const ambientSound = new AmbientEngine();
